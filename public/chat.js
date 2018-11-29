$(function(){
	console.log("index init");
	var socket = io.connect("http://localhost:3000/");
	$("#waiting-msg").hide();
	var client=false;
	var server=false;
	
	var msg  = $("#message");
	var user = $("#username");
	var to   = "";
	var usersarray = [];
	
	
	// to.hide();
	// msg.hide();
	user.hide();
	$("#send_name").hide();
	$("#send_message").hide();
	$("#open-btn").hide();
		
	msg.keypress(function(e){
		if(e.keyCode==13){
			e.preventDefault();
			socket.emit("new_message",{client:client,server:server,username:user.val(),message:msg.val()});
				$("#clientmessages").append("<li><div class='sent-message'><h4>from:"+user.val()+"</h4><p>message:"+msg.val()+"</p></div></li><br/>");
			setTimeout(function(){
				msg.val("");
			},100);
		}
	});	
	
	/* $(".message").keypress(function(e){
		var i = e.id;
	   	if(e.keyCode==13){
			e.preventDefault();
			socket.emit("new_message",{client:client,server:server,to:usersarray[i],username:user.val(),message:$("#servermessage").val()});
				$("#server-messages_"+i).append("<li><div class='sent-message'><h4>from:"+user.val()+"</h4><p>message:"+$("#servermessage_"+i).val()+"</p></div></li><br/>");
			setTimeout(function(){
				$("#servermessage_"+i).val("");
			},100);
		}
	}); */

    $(document).keypress(function(e) {
        if(e.target.className=="message"){
			var username = e.target.id.split("_")[1];
			if(e.keyCode==13){
				e.preventDefault();
				socket.emit("new_message",{client:client,server:server,to:username,username:user.val(),message:$("#servermessage_"+username).val()});
					$("#server-messages_"+username).append("<li><div class='sent-message'><h4>from:"+user.val()+"</h4><p>message:"+$("#servermessage_"+username).val()+"</p></div></li><br/>");
				setTimeout(function(){
					$("#servermessage_"+username).val("");
				},100);
			}
		}
    });
	
	// for(var i in usersarray){
		// $("#servermessage_"+i).keypress(function(e){
			// if(e.keyCode==13){
				// e.preventDefault();
				// socket.emit("new_message",{client:client,server:server,to:usersarray[i],username:user.val(),message:$("#servermessage").val()});
					// $("#server-messages_"+i).append("<li><div class='sent-message'><h4>from:"+user.val()+"</h4><p>message:"+$("#servermessage_"+i).val()+"</p></div></li><br/>");
				// setTimeout(function(){
					// $("#servermessage_"+i).val("");
				// },100);
			// }
		// });	
	// }
	
	$("#adminregisterButton").click(function(){
		server=true;
		user.show();
		$("#adminregisterButton").hide();
		$("#userregisterButton").hide();
		$("#send_name").show();
		$("#header").append("<h2 class='header'>Admin Page</h2>");
	});
	
	$("#userregisterButton").click(function(){
		client=true;
		user.show();
		$("#adminregisterButton").hide();
		$("#userregisterButton").hide();
		$("#send_name").show();
		$("#header").append("<h2 class='header'>User Page</h2>");
	});
	
	$("#send_name").click(function(){
		socket.emit("change_username",{client:client,server:server,username:user.val()});
		user.hide();
		// to.hide();
		// msg.show();
		// $("#send_message").show();
		// $("#open-btn").show();
		if(client){
			$("#clientForm").attr('style',"display:block");
		}else if(server){
			// $("#serverForm").attr('style',"display:block");
			$("#waiting-msg").show();
		}
		$("#send_name").hide();
	});
	
	$("#open-btn").click(function(){
		if(client){
			$("#clientForm").attr('style',"display:block");
		}else if(server){
			$("#serverForm").attr('style',"display:block");
		}
	})
	
	// $("#send_message").click(function(){
		// socket.emit("new_message",{client:client,server:server,to:to.val(),username:user.val(),message:msg.val()});
		// setTimeout(function(){
			// msg.val("");
		// },100);
	// });
	
	socket.on("new_message",function(data){
		if(client && data.message){
			$("#clientmessages").append("<li><div class='received-message'><h4>from:"+data.username+"</h4><p>message:"+data.message+"</p></div></li><br/>");
		}else if(data.message){
			$("#serverForm").attr('style',"display:block");
			$("#waiting-msg").hide();
			to=data.username;
			if(usersarray.indexOf(data.username)==-1){
				usersarray.push(data.username);
				console.log(usersarray);
				console.log(usersarray.indexOf(data.username));
				$("#serverForm").append('<form class="form-container" id="client_'+data.username+'" novalidate><h3>Chat with user</h3><div><ul class="server-messages" id="server-messages_'+data.username+'"><li><div class="received-message"><h4>from:'+data.username+'</h4><p>message:'+data.message+'</p></div></li><br/></ul></div><input placeholder="Type message.." class="message" id="servermessage_'+data.username+'" name="msg" autocomplete="off"></input></form>')
			}else{
				$("#server-messages_"+data.username).append("<li><div class='received-message'><h4>from:"+data.username+"</h4><p>message:"+data.message+"</p></div></li><br/>");
			}
		}
	});
	
	socket.on("sending_error",function(data){
		alert(data.message);
	});
	
	socket.on("client_disconnected",function(data){
		alert("Client Disconnected");
	});
	
	socket.on("user_busy",function(data){
		var index=usersarray.indexOf(data.username);
        if(index!=-1){
			if(data.admin!=$("#username").val()){
				$("#client_"+usersarray[index]).remove();
				usersarray.splice(index,1);
			}else{
				for(var i in usersarray){
					if(usersarray[i]!=usersarray[index]){
						$("#client_"+usersarray[i]).remove();
						usersarray.splice(i,1);
					}
				}
			}
		}
		if(usersarray.length==0){
			$("#serverForm").attr('style',"display:none");
			// $sss("#server-messages").html("");
			$("#waiting-msg").show();
		}
	});
	
	window.onbeforeunload=function(){
		var uname=$("#username").val();
		socket.emit("disconnected",{client:client,server:server,username:uname});
	};
	// window.onunload=closingFunction();
	
	
	
})