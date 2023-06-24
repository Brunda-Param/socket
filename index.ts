import Listener from './listner';


Listener.getInstance().startServerSocket().then(res=>{
    Listener.getInstance().listenChanges();
}).catch(e=>{

})

