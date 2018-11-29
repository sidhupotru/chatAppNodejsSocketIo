const express = require('express');
const app 	  = express();
var url = require('url');
var clients = [];
var admins = [];

app.set('view engine','ejs');

app.use(express.static('public'));

app.get('/',(req,res)=>{
	//res.render('index');
	res.redirect("user");
});

app.get('/admin',(req,res)=>{
	res.render('admin');
});

app.get('/user',(req,res)=>{
	// console.log(req);
	res.render('client');
});

server = app.listen(3000);

const io = require('socket.io')(server);

io.on("connection",(socket)=>{
	console.log('new user connected');
	
	// socket.username="Anonymous";
	
	socket.on("change_username",(data)=>{
		//socket.username=data.username;
		var randomNum=1;
		// console.log("username changed to:::"+socket.username);
		if(data.client){
			for(var i in clients){
				socket.username="client_"+parseInt(randomNum);
				if(clients[i].user==socket.username){
					randomNum=parseInt(randomNum)+1;
				}
			}
			socket.username="client_"+parseInt(randomNum);
			clients.push({
				'user':socket.username,
				'id'  :socket.id
			})
			io.sockets.sockets[socket.id].emit('getName',{name:socket.username});
		}else if(data.server){
			console.log("entered to admin block");
			for(var i in admins){
				socket.username="admin_"+randomNum;
				if(admins[i].user==socket.username){
					randomNum=parseInt(randomNum)+1;
					console.log("increased random num::"+randomNum);
				}
			}
			socket.username="admin_"+randomNum;
			console.log("username changed to:::"+socket.username);
			admins.push({
				'user':socket.username,
				'id'  :socket.id
			});
			io.sockets.sockets[socket.id].emit('getName',{name:socket.username});
		}
		console.log("clients:::"+JSON.stringify(clients));
		console.log("admins:::"+JSON.stringify(admins));
	})
	
	socket.on("new_message",(data)=>{
		console.log(data);
		var socketId="";
			if(data.server){
				for(var i in clients){
					console.log(clients[i].user+"   "+data.to)
					if(clients[i].user==data.to){
						if(clients[i]["conectedto"]!="" && clients[i]["conectedto"]!=undefined){
							if(clients[i]["conectedto"] == data.username){
								socketId=clients[i].id;
								//break;
							}else{
								for(var j in admins){
									if(admins[j].user==data.username){
										socketId=admins[j].id;
										io.sockets.sockets[socketId].emit('user_busy',{message:"User connected to another admin",username:data.to,admin:data.username});
										socketId="";
										return;
									}
								}
							}
						}else{
							for(var j in admins){
								if(admins[j].user==data.username){
									admins[j]["conectedto"]=clients[i].user
								}//else{
									socketId=admins[j].id;
									console.log(data);
									io.sockets.sockets[socketId].emit('user_busy',{message:"User connected to another admin",username:data.to,admin:data.username});
									socketId="";
								//}
							}
							clients[i]["conectedto"] = data.username
							socketId=clients[i].id;
							break;
						}
					}
				}
				// for(var i in admins){
					// if(admins[i].user==data.username){
						// admins[i].
					// }
				// }
				console.log(data);
				if(io.sockets.sockets[socketId]){
					io.sockets.sockets[socketId].emit('new_message',{message:data.message,username:data.username});
					socketId="";
				}else{
				   if(data.username){
					for(var i in clients){
						console.log(clients[i].user+"   "+data.username)
						if(clients[i].user==data.username){
							socketId=clients[i].id;
							console.log(socketId);
						}
					}
				   }
					console.log('is socket id connected'+Object.keys(io.sockets.sockets));
					if(io.sockets.sockets[socketId]){
						console.log(true);
						io.sockets.sockets[socketId].emit('sending_error',{username:data.username});
						socketId="";
					}
				}
			}else{
				var conectedto="";
				for(var i in clients){
					console.log(clients[i].user+"   "+data.to)
					if(clients[i].user==data.username){
						conectedto=clients[i]["conectedto"];
						console.log(socketId);
					}
				}
				console.log("conectedto:::"+conectedto)
				if(conectedto!="" && conectedto!=undefined){
					for(var i in admins){
						console.log(admins[i].user);
						if(admins[i].user==conectedto){
								socketId=admins[i].id;
								conectedto="";
								console.log(socketId)
								io.sockets.sockets[socketId].emit('new_message',{message:data.message,username:data.username});
								socketId="";
							}
					}
				}else{
					for(var i in admins){
						socketId=admins[i].id;
						console.log(admins[i].user+":::"+socketId);
						// console.log(data.username);
						if(admins[i]["conectedto"]=="" || admins[i]["conectedto"]==undefined){
							console.log("sendingto::admin"+(i+1));
							io.sockets.sockets[socketId].emit('new_message',{message:data.message,username:data.username});
							socketId="";
						}
					}
				}
			}
	})
    
	socket.on("disconnected",(data)=>{
		console.log("disconnected event start");
		console.log(data);
		if(data.server){
			for(var i in admins){
				if(admins[i].user==data.username){
					admins.splice(admins[i],1);
					console.log("admin disconnected:::"+i);
				}
			}
		}else{
			for(var i in clients){
				if(clients[i].user==data.username){
					notifyAdmin(clients[i].conectedto);
					clients.splice(clients[i],1);
					console.log("client disconnected:::"+i);
				}
			}
		}
		console.log("disconnected event end");
	});
	
	function notifyAdmin(admin){
		var socketId;
		for(var i in admins){
			if(admins[i].user==admin){
				socketId=admins[i].id;
				admins[i]["conectedto"]="";
			}
		}
		if(socketId){
			io.sockets.sockets[socketId].emit('client_disconnected');
		}
		socketId="";
	}

	function getRandomKey() {
		var text = "";
		var possible = "123456789";
	
		for (var i = 0; i < 2; i++)
		  text += possible.charAt(Math.floor(Math.random() * possible.length));
	
		console.log(text);
		RandomKey=text+"";
		return text+"";
	}
	
});

