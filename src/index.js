const express = require('express');
const fetch = require('node-fetch');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const Web3 = require('web3');
var Contract = require('web3-eth-contract');
var cors = require('cors');
require('dotenv').config();
var moment = require('moment');
const BigNumber = require('bignumber.js');
const uc = require('upper-case');

const Cryptr = require('cryptr');

const abiExchage = require("./abiExchange.js");
const abiInventario = require("./abiInventario.js");
const abiToken = require("./abitoken.js");

const cryptr = new Cryptr(process.env.APP_ENCR_STO); 

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


function encryptString(s){

    if (typeof s === 'string'){
        return cryptr.encrypt(s)
    }else{
        return {};
    }

    
} 

function decryptString(s){
    if (typeof s === 'string'){
        return cryptr.decrypt(s)
    }else{
        return {};
    }
    
}

//console.log(("HolA Que Haze").toUpperCase())
//console.log(("HolA Que Haze").toLowerCase())

//var cosa = {cosita: "1,23456"}
//console.log(cosa["cosita"].replace(",","."))


const delay = (ms) => new Promise((res) => setTimeout(res, ms));

var superUser = require("./superUser");

const port = process.env.PORT || 3016;
const PEKEY = process.env.APP_PRIVATEKEY;
const TOKEN = process.env.APP_TOKEN;
const TOKEN2 = process.env.APP_TOKEN2;
const TokenEmail = "nuevo123";

const uri = process.env.APP_URI;

const transancTime = 40;

const TimeToMarket = process.env.APP_TIMEMARKET || 86400 * 7;

const RED = process.env.APP_RED || "https://bsc-dataseed.binance.org/";
const addressInventario = process.env.APP_CONTRACT_INVENTARIO || "0x16Da4914542574F953b31688f20f1544d4E89537";
const addressExchnge = process.env.APP_CONTRACT_EXCHANGE || "0x7eeAA02dAc001bc589703B6330067fdDAeAcAc87";
const addressContractToken = process.env.APP_CONTRACTTOKEN || "0x7Ca78Da43388374E0BA3C46510eAd7473a1101d4";//DCSC

const imgDefault = "0";

let web3 = new Web3(new Web3.providers.HttpProvider(RED));
Contract.setProvider(RED);
var contractE = new Contract(abiExchage,addressExchnge);

//console.log(web3)

const contractExchange = new web3.eth.Contract(abiExchage,addressExchnge);
const contractInventario = new web3.eth.Contract(abiInventario,addressInventario);
const contractToken = new web3.eth.Contract(abiToken,addressContractToken); // DCSC
const contractToken2 = new web3.eth.Contract(abiToken,"0x55d398326f99059fF775485246999027B3197955"); // USDT


web3.eth.accounts.wallet.add(PEKEY);

//console.log(web3.eth.accounts.wallet[0].address);

//console.log(await web3.eth.accounts.wallet);
//tx web3.eth.accounts.signTransaction(tx, privateKey);
/*web3.eth.sendTransaction({
    from: "0xEB014f8c8B418Db6b45774c326A0E64C78914dC0",
    gasPrice: "20000000000",
    gas: "21000",
    to: '0x3535353535353535353535353535353535353535',
    value: "1000000000000000000",
    data: ""
}, 'MyPassword!').then(console.log);*/
//console.log(web3.eth.accounts.wallet);
const options = { useNewUrlParser: true, useUnifiedTopology: true };

mongoose.connect(uri, options)
    .then(async() => { console.log("Conectado Exitodamente!");})
    .catch(err => { console.log(err); });

const user = require("./modelos/usuarios");
const appstatuses = require("./modelos/appstatuses");
const appdatos = require("./modelos/appdatos");
const playerData = require("./modelos/playerdatas");
const userplayonline = require("./modelos/userplayonline");
const playerdatas = require('./modelos/playerdatas');

async function precioCSC(){
    
    var result1 = await contractToken.methods
        .balanceOf("0x7Ca78Da43388374E0BA3C46510eAd7473a1101d4")
        .call({ from: web3.eth.accounts.wallet[0].address })
        .catch(err => {console.log(err); return 0})
        result1 = new BigNumber(result1).shiftedBy(-18).toNumber();

        //console.log(result1) // CSC

        var result2 = await contractToken2.methods
        .balanceOf("0x7Ca78Da43388374E0BA3C46510eAd7473a1101d4")
        .call({ from: web3.eth.accounts.wallet[0].address })
        .catch(err => {console.log(err); return 0})
        result2 = new BigNumber(result2).shiftedBy(-18).toNumber();

        //console.log(result2) // BUSD

        //console.log(result2/result1) // 1 CSC en BUSD

        //console.log(1/(result2/result1)) // 1 BUSD en CSC

        return result2/result1;

}

async function estimar(){
    await contractE.methods.gastarCoinsfrom("1000000000000000000", "0x0c4c6519E8B6e4D9c99b09a3Cda475638c930b00").estimateGas({from: "0x0c4c6519E8B6e4D9c99b09a3Cda475638c930b00"})
}

app.get('/api/v1/priceCSC',async(req,res) => {
    await estimar();
    res.send(await precioCSC()+"");
});

app.get('/', require("./v1/funcionando"));

app.get('/api', require("./v1/funcionando"));

app.get('/api/v1', require("./v1/funcionando"));

app.use('/api/v2', require("./v2"));

app.get('api/v1/tiempo', async(req,res) => {
    res.send(moment(Date.now()).format('MM-DD-YYYY/HH:mm:ss'));
});

app.get('/api/v1/date',async(req,res) => {
    res.send(Date.now()+"");
});

app.get('/api/v1/formations-teams/:wallet',async(req,res) => {

    var wallet =  req.params.wallet.toLowerCase();

    var formaciones = [];

    var inventario = [];

    var cantidad = 44;

    var isSuper = 0;

    for (let index = 0; index < superUser.length; index++) {
        if((superUser[index]).toLowerCase() === wallet){
            isSuper = 1;
        }
    }

    for (let index = 0; index < 5; index++) {
        formaciones[index] = isSuper;
    }

    for (let index = 0; index < cantidad; index++) {
        inventario[index] = isSuper;
    }
        
    if (isSuper === 0) {

        var verInventario = await contractInventario.methods
        .verInventario(wallet)
        .call({ from: web3.eth.accounts.wallet[0].address })
        .catch(err => {console.log(err); return 0})

        var nombres_items = await contractInventario.methods
        .verItemsMarket()
        .call({ from: web3.eth.accounts.wallet[0].address })
        .catch(err => {console.log(err); return 0})

  
        for (let index = 0; index < verInventario.length; index++) {

            var item = nombres_items[0][verInventario[index]];

            if(item.indexOf("f") === 0){
                formaciones[parseInt(item.slice(item.indexOf("f")+1,item.indexOf("-")))-1] =  1;
            }
    
            if(item.indexOf("t") === 0){
                inventario[parseInt(item.slice(item.indexOf("t")+1,item.indexOf("-")))-1] =  1;
            }
    
        }

        if (quitarLegandarios === "true") { // quitar legendarios
            for (let index = 0; index < 3; index++) {
                inventario[index] = 0;
            }
        }

        if (quitarEpicos === "true") { // quitar epicos
            for (let index = 3; index < 10; index++) {
                inventario[index] = 0;
            }
        }

        if (quitarComunes === "true") { // quitar Comunes
            for (let index = 10; index < cantidad; index++) {
                inventario[index] = 0;
            }
            
        }
    }

    // añadir equipo betatester
    for (let t = 0; t < testers.length; t++) {
        if(testers[t].toLowerCase() == wallet){
            inventario[inventario.length-1] = 1;
        }
    }

    inventario = [...inventario,1,...formaciones]
    //console.log(inventario)

    res.send(inventario.toString());

});

app.get('/api/v1/coins/:wallet',async(req,res) => {

    let wallet =  req.params.wallet.toLowerCase();

    if(!web3.utils.isAddress(wallet)){
        console.log("wallet incorrecta: "+wallet)
        res.send("0");
    }else{
            usuario = await user.find({ wallet: uc.upperCase(wallet) });

        if (usuario.length >= 1) {
            usuario = usuario[0];
            res.send(usuario.balanceUSD+"");

        }else{
            console.log("creado USUARIO al consultar monedas: "+wallet)
            var users = new user({
                wallet: uc.upperCase(wallet),   
                email: "",
                password: "",
                username: "", 
                active: true,
                payAt: Date.now(),
                checkpoint: 0,
                reclamado: false,
                balance: 0,
                balanceUSD: 0,
                ingresado: 0,
                retirado: 0,
                deposit: [],
                retiro: [],
                txs: [],
                pais: "null",
                imagen: imgDefault,
                wcscExchange: 0
            });

            users.save().then(()=>{
                console.log("Usuario creado exitodamente");
                
            })

            res.send("0");
                
            
        }

    }

    
});

app.post('/api/v1/coinsaljuego/:wallet',async(req,res) => {

    var wallet =  req.params.wallet.toLowerCase();

    var usuario = await user.findOne({ wallet: uc.upperCase(wallet) });

    if(!req.body.data){
        res.send("false");
        return;
    }

    req.body = JSON.parse(decryptString(req.body.data))

    if(req.headers.authorization.split(' ')[1] == TOKEN  && web3.utils.isAddress(wallet) && Date.now()-parseInt(req.body.time) <= transancTime*1000 ){

        console.log("To Game: "+req.body.coins+" | "+uc.upperCase(wallet))

        var result = await contractInventario.methods.largoInventario(wallet).call({ from: web3.eth.accounts.wallet[0].address })
        .catch(err => {console.log(err); return 0})

        result = parseInt(result);

        if(usuario && usuario.active && req.body.precio*1 > 0 && result > 0 ){

            await delay(Math.floor(Math.random() * 12000));

            coins = new BigNumber(req.body.coins).shiftedBy(18);
            precio = 1*req.body.precio;

            if(await monedasAlJuego(coins,wallet,1,precio)){
                res.send("true");

            }else{
                res.send("false");

            }

        }else{
            res.send("false");
        }
    }else{
        res.send("false");
    }
		
    
});

async function monedasAlJuego(coins,wallet,intentos,precio){

    await delay(Math.floor(Math.random() * 12000));

    var paso = false;
    var gases = 0; 
    var gasLimit = 0;

    var usuario = await contractExchange.methods.investors(wallet).call({ from: web3.eth.accounts.wallet[0].address});
    usuario.balance = new BigNumber(usuario.balance).shiftedBy(-18).toNumber();

    try {
        gases = await web3.eth.getGasPrice(); 
 
    } catch (err) {
        console.log("error al estimar el gasprice")
    }   


    try {
        gasLimit = await contractExchange.methods.gastarCoinsfrom(coins, wallet).estimateGas({from: web3.eth.accounts.wallet[0].address})
    
    }catch(err){
        console.log("error al estimar el gaslimit 2")

    } 

    if(usuario.balance - coins.shiftedBy(-18).toNumber() >= 0){

        var exitoso = await contractExchange.methods.gastarCoinsfrom(coins, wallet).send({ from: web3.eth.accounts.wallet[0].address, gas: gasLimit,  gasPrice: gases })
        .then(() => {return true;})
        .catch(() => {return false;})

        if(exitoso){
            var myUser = await user.findOne({ wallet: uc.upperCase(wallet) });
            
            if(myUser && myUser.active){
                    
                await user.updateOne({ wallet: uc.upperCase(wallet) }, [
                    {$set: {balanceUSD: {$sum:["$balanceUSD",coins.shiftedBy(-18).toNumber()*precio]}}}
                ])
                
                console.log("SEND IN GAME: "+coins.shiftedBy(-18)+" # "+uc.upperCase(wallet)+" | "+intentos+" intentos")
                
                paso = true;
            }

        }else{
            
            intentos++;
        
            if(intentos > 3 ){
                console.log("envio de "+coins.shiftedBy(-18)+" a Game CANCELADO"+uc.upperCase(wallet)+" : "+intentos)
                paso = false;
            }else{
                await delay(Math.floor(Math.random() * 12000));
                console.log(coins.shiftedBy(-18)+" ->  "+uc.upperCase(wallet)+" : "+intentos)
                paso = await monedasAlJuego(coins,wallet,intentos);

            }
            
        }
            
    }else{
        console.log("no balance")
        paso = false;
    }

    return paso;

}

app.get('/api/v1/coinsdiaria/',async(req,res)=>{

    res.send((await appdatos.findOne({})).diponibleDiaria.toString(10))
})

app.get('/api/v1/time/coinsalmarket/:wallet',async(req,res)=>{
    var wallet =  req.params.wallet.toLowerCase();

    if(web3.utils.isAddress(wallet)){

        var usuario = await user.findOne({ wallet: uc.upperCase(wallet) },{wallet:1,payAt:1});

        res.send((usuario.payAt + (TimeToMarket * 1000)).toString())
        
    }else{
        res.send((Date.now()+(TimeToMarket * 1000)).toString())
    }
});

app.post('/api/v1/coinsalmarket/:wallet',async(req,res) => {

    var wallet =  req.params.wallet.toLowerCase();

    req.body = JSON.parse(decryptString(req.body.data))

    if( req.headers.authorization.split(' ')[1] == TOKEN && web3.utils.isAddress(wallet) && Date.now()-parseInt(req.body.time) <= transancTime*1000){

        console.log("To Exchange: "+req.body.coins+" | "+uc.upperCase(wallet))

        var coins = new BigNumber(req.body.coins).shiftedBy(18);
        var precio = new BigNumber(req.body.precio).toNumber();
        
        var result = await contractInventario.methods.largoInventario(wallet).call({ from: web3.eth.accounts.wallet[0].address })
        .catch(err => {console.log(err); return 0})

        result = parseInt(result);

        var usuario = await user.findOne({ wallet: uc.upperCase(wallet) },{password:1,username:1,email:1,balanceUSD:1,active:1});

        if (usuario && usuario.active && result > 0 && usuario.password !== "" && usuario.email !== "" && usuario.username !== "" && usuario.balanceUSD > 0 && usuario.balanceUSD-coins.shiftedBy(-18).toNumber() >= 0 ) {

            //var usuario = await user.findOne({ wallet: uc.upperCase(wallet) },{balanceUSD:1});

            //await delay(Math.floor(Math.random() * 12000));

            console.log("pass");

            if(await monedasAlExchange(coins, wallet,1,precio) ){
                res.send("true");

            }else{
                console.log("pass2");
                res.send("false");

            }
            
        }else{
            console.log("pass3");

            res.send("false");

        }

    }else{


        res.send("false");
    }
		
});

async function monedasAlExchange(coins,wallet,intentos,precio){

    await delay(Math.floor(Math.random() * 12000));

    var paso = false;
    var gases = 0; 
    var gasLimit = 0;

    var envioExchange = coins.shiftedBy(-18).dividedBy(precio).shiftedBy(18).decimalPlaces(0)

    try{
        gases = await web3.eth.getGasPrice(); 
        gasLimit = await contractExchange.methods.asignarCoinsTo(envioExchange.toString(10), wallet).estimateGas({from: web3.eth.accounts.wallet[0].address});
    
    } catch (err) {
        
        console.log("error al estimar el gas");
    }

    usuario = await user.findOne({ wallet: uc.upperCase(wallet) });

    if(usuario && usuario.active && usuario.balanceUSD-coins.shiftedBy(-18).toNumber() >= 0 ){
        
        var envioExitoso = await contractExchange.methods.asignarCoinsTo(envioExchange.toString(10), wallet)
        .send({ from: web3.eth.accounts.wallet[0].address, gas: gasLimit, gasPrice: gases })
        .then(() => {return true;})
        .catch(() => {return false;})

        if(envioExitoso ){

            await user.updateOne({ wallet: uc.upperCase(wallet) },[
                {$set: {balanceUSD:{$subtract: ["$balanceUSD",coins.shiftedBy(-18).toNumber()]},payAt: Date.now()}}
            ])
            
            console.log("SEND TO Exchange: "+envioExchange.shiftedBy(-18)+" DCSC # "+uc.upperCase(wallet))
                        
            paso = true;

        }else{
            intentos++;
            
            if(intentos > 3 ){
                console.log("envio de "+coins.shiftedBy(-18)+" a Market CANCELADO"+uc.upperCase(wallet)+" : "+intentos)
                paso = false;
            }else{
                console.log(coins.shiftedBy(-18)+" ->  "+uc.upperCase(wallet)+" : "+intentos)
                await delay(Math.floor(Math.random() * 12000));
                paso = await monedasAlExchange(coins,wallet,intentos,precio);

            }
            
        }
    }
    

    return paso;

}

app.post('/api/v1/sendmail',async(req,res) => {
    //console.log(req.query);
    if(req.body.destino && req.body.code){

        var resultado = await fetch("https://brutusgroup.tk/mail.php?destino="+req.body.destino+"&code="+req.body.code+"&token=crypto2021");

        if (await resultado.text() === "true") {
            res.send("true");
        }else{
            res.send("false");
        }

    }else{
        res.send("false");
    }

});

app.get('/api/v1/user/exist/:wallet',async(req,res) => {

    var wallet =  req.params.wallet.toLowerCase();
     
    if(web3.utils.isAddress(wallet)){

        usuario = await user.find({ wallet: uc.upperCase(wallet) })
            .catch(err => {
                console.log("usuario inexistente");
                res.send("false");
                return;
            });

        if (usuario.length >= 1) {
            res.send("true");
        }else{
    
            res.send("false");
        }
    }else{
        res.send("false");
    }
});

app.get('/api/v1/user/active/:wallet',async(req,res) => {
    
    var wallet =  req.params.wallet.toLowerCase();
     
    if(web3.utils.isAddress(wallet)){

        usuario = await user.find({ wallet: uc.upperCase(wallet) });

        if (usuario.length >= 1) {
            usuario = usuario[0];
            res.send(""+usuario.active);
        }else{
            res.send("false");
        }
    }else{
        res.send("false");
    }
});

app.get('/api/v1/user/username/:wallet',async(req,res) => {
    var wallet =  req.params.wallet.toLowerCase();
     
    if(web3.utils.isAddress(wallet)){

        usuario = await user.find({ wallet: uc.upperCase(wallet) });

        if (usuario.length >= 1) {
            usuario = usuario[0];

            res.send(usuario.username);
        }else{
            res.send("false");
        }
    }else{
        res.send("false");
    }
});

app.get('/api/v1/user/wallet/',async(req,res) => {
    var username =  req.query.username;
     
    usuario = await user.find({ username: username });

    if (usuario.length >= 1) {
        usuario = usuario[0];

        res.send(usuario.wallet);
    }else{
        res.send("false");
    }
    
});

app.get('/api/v1/user/email/:wallet',async(req,res) => {
    var wallet =  req.params.wallet.toLowerCase();
     
    if( req.query.tokenemail === TokenEmail && web3.utils.isAddress(wallet)){

        usuario = await user.findOne({ wallet: uc.upperCase(wallet) });

        res.send(usuario.email);
        
    }else{
        res.send("false");
    }
});

app.get('/api/v1/user/pais/:wallet',async(req,res) => {
    var wallet =  req.params.wallet.toLowerCase();
     
    if(web3.utils.isAddress(wallet)){

        usuario = await user.find({ wallet: uc.upperCase(wallet) });

        if (usuario.length >= 1) {
            usuario = usuario[0];

            res.send(usuario.pais);
        }else{
            res.send("false");
        }
    }else{
        res.send("false");
    }
});

app.get('/api/v1/imagen/user',async(req,res) => {
    var username =  req.query.username;
     
    usuario = await user.find({ username: username });

    if (usuario.length >= 1) {
        usuario = usuario[0];
      
        if(usuario.imagen){
            if(usuario.imagen.indexOf('https://')>=0){
                res.send(usuario.imagen);
            }else{
                res.send(imgDefault);

            }
        }else{
            res.send(imgDefault);

        }
    }else{
        res.send(imgDefault);
    }

});

app.get('/api/v1/user/ban/:wallet',async(req,res) => {
    var wallet =  req.params.wallet.toLowerCase();
     
    if(web3.utils.isAddress(wallet)){

        usuario = await user.find({ wallet: uc.upperCase(wallet) });
        
  
            if (usuario.length >= 1) {
                usuario = usuario[0];

                res.send(!usuario.active+"");
            }else{
                var users = new user({
                    wallet: uc.upperCase(wallet),
                    email: "",
                    password: "",
                    username: "", 
                    active: true,
                    payAt: Date.now(),
                    checkpoint: 0,
                    reclamado: false,
                    balance: 0,
                    balanceUSD: 0,
                    ingresado: 0,
                    retirado: 0,
                    deposit: [],
                    retiro: [],
                    txs: [],
                    pais: "null",
                    imagen: imgDefault,
                    wcscExchange: 0
                });
        
                users.save().then(()=>{
                    console.log("Nuevo Usuario creado exitodamente");
                    
                })
                res.send("false");
            }



            
    }else{
        res.send("true");
    }
});

app.post('/api/v1/user/update/info/:wallet',async(req,res) => {

    var wallet =  req.params.wallet.toLowerCase();
    
    if( req.headers.authorization.split(' ')[1] == TOKEN && web3.utils.isAddress(wallet)){

        usuario = await user.find({ wallet: uc.upperCase(wallet) });

        if (usuario.length >= 1) {
            var datos = usuario[0];
            if(datos.active){
                if (req.body.email) {
                    req.body.email =  req.body.email.toLowerCase();
                    datos.email = req.body.email;
                }

                if (req.body.username) {
                    datos.username = req.body.username;
                }

                if (req.body.password) {
                    datos.password = req.body.password;
                }

                if (req.body.pais) {
                    datos.pais = req.body.pais;
                }

                if (req.body.imagen) {
                    datos.imagen = req.body.imagen;
                }

                if (req.body.ban) {
                    if(req.body.ban === "true"){
                        datos.active = false;
                    }else{
                       
                        datos.active = false;
                        
                    }
                    
                }

                if (req.body.email || req.body.username || req.body.password || req.body.pais || req.body.ban || req.body.imagen){
                    update = await user.updateOne({ wallet: uc.upperCase(wallet) }, [
                        {$set: datos}
                    ]);
                    res.send("true");
                }else{
                    res.send("false");
                }
                
            }else{
                res.send("false");
            }
    
        }else{
            console.log("creado USUARIO al actualizar info: "+wallet)
            var email = "";
            var username = "";
            var password = "";

            if (req.body.email) {
                email = req.body.email;
            }

            if (req.body.username) {
                username = req.body.username;
            }

            if (req.body.password) {
                password = req.body.password;
            }
            var users = new user({
                wallet: uc.upperCase(wallet),
                email: email,
                password: password,
                username: username, 
                active: true,
                payAt: Date.now(),
                checkpoint: 0,
                reclamado: false,
                balance: 0,
                balanceUSD: 0,
                ingresado: 0,
                retirado: 0,
                deposit: [{amount: req.body.coins,
                    date: Date.now(),
                    finalized: true,
                    txhash: "Acount Creation "
                }],
                retiro: [],
                txs: [],
                pais: "null",
                imagen: imgDefault,
                wcscExchange: 0
            });
    
            users.save().then(()=>{
                console.log("Usuario creado exitodamente");
                
            })

            res.send("false");
                
            
        }


    }else{
        res.send("false");
    }
		
});

app.post('/api/v1/user/auth/:wallet',async(req,res) => {

    var wallet =  req.params.wallet.toLowerCase();

    if( req.headers.authorization.split(' ')[1] == TOKEN && web3.utils.isAddress(wallet)){

        usuario = await user.find({ wallet: uc.upperCase(wallet) });

        if (usuario.length >= 1) {
            var usuario = usuario[0];

            if(usuario.password === req.body.password && req.body.password != "" && req.body.password.length >= 8){

                if(usuario.active ){

                    res.send("true");
                    
                }else{
                    
                    res.send("false");
                    
                }
            }else{
                console.log("Error Loggin:"+uc.upperCase(wallet)+": "+req.body.password);
                res.send("false");
            }
    
        }else{
           
            res.send("false");
            
        }


    }else{
        res.send("false");
    }
		
});

app.get('/api/v1/username/disponible/',async(req,res) => {

    var username =  req.query.username;

    usuario = await user.find({ username: username });

    //console.log(usuario)

    if (usuario.length >= 1) {
        res.send("false");
    }else{
        res.send("true");
    }

});

app.get('/api/v1/email/disponible/',async(req,res) => {

    var email =  req.query.email;

    usuario = await user.find({ email: email });

    if (usuario.length >= 1) {
        //res.send("false");
        res.send("true");
    }else{
        res.send("true");
    }

});

app.get('/api/v1/consulta/miranking/:wallet',async(req,res) => {

    var wallet =  uc.upperCase(req.params.wallet);

    var myuser = await playerData.findOne({wallet: wallet},
        {_id:0,BallonSet:0,DificultConfig:0,LastDate:0,PlaysOnlineTotal:0,LeaguesOnlineWins:0,DiscountMomment:0,DuelsOnlineWins:0,DuelsPlays:0,FriendLyWins:0,FriendlyTiming:0,LeagueDate:0,LeagueOpport:0,LeagueTimer:0,MatchLose:0,MatchWins:0,MatchesOnlineWins:0,Music:0,PhotonDisconnected:0,QualityConfig:0,StadiumSet:0,PlaysTotal:0,TournamentsPlays:0,Version:0,VolumeConfig:0,Plataforma:0,GolesEnContra:0,GolesAFavor:0,FirstTime:0,DrawMatchs:0,DrawMatchsOnline:0,LeaguePlay:0,Analiticas:0,Fxs:0,__v:0,Soporte:0,Fullscreen:0,Resolucion:0}
    )

    var playDat = await playerData.find({CupsWin: {$gte: myuser.CupsWin}},
        {_id:0,BallonSet:0,DificultConfig:0,LastDate:0,PlaysOnlineTotal:0,LeaguesOnlineWins:0,DiscountMomment:0,DuelsOnlineWins:0,DuelsPlays:0,FriendLyWins:0,FriendlyTiming:0,LeagueDate:0,LeagueOpport:0,LeagueTimer:0,MatchLose:0,MatchWins:0,MatchesOnlineWins:0,Music:0,PhotonDisconnected:0,QualityConfig:0,StadiumSet:0,PlaysTotal:0,TournamentsPlays:0,Version:0,VolumeConfig:0,Plataforma:0,GolesEnContra:0,GolesAFavor:0,FirstTime:0,DrawMatchs:0,DrawMatchsOnline:0,LeaguePlay:0,Analiticas:0,Fxs:0,__v:0,Soporte:0,Fullscreen:0,Resolucion:0}
    ).sort({"CupsWin": -1, "UserOnline": -1}).limit(300);


    if (playDat.length >= 1) {

        if (playDat.length < 300) {
            res.send(playDat.length+","+myuser.CupsWin);
        }else{
            res.send("0,"+myuser.CupsWin);
        }
        

    }else{
    
        res.send("0,0");
        
    }

});

app.get('/api/v1/consulta/leadboard',async(req,res) => {

    var cantidad;

    if(!req.query.cantidad){
        cantidad = 20;
    }else{
        cantidad = parseInt(req.query.cantidad);
        if(cantidad > 100 )cantidad= 100;
    }

    var lista = [];

    var aplicacion = await playerData.find({}).limit(cantidad).sort({"CupsWin": -1, "UserOnline": -1});
      
    if (aplicacion.length >= 1) {
        
        for (let index = 0; index < aplicacion.length; index++) {
            lista[index] = aplicacion[index].wallet;
            
        }
        res.send(lista.toLocaleString());

    }else{
        res.send("null");
            
    }
    
});

app.get('/api/v1/consulta/redwardleague',async(req,res) => {

    if(req.query.version){
        var aplicacion = await appstatuses.find({version: req.query.version});

        var appData = await appdatos.find({});

        if (appData.length >= 1) {
            appData = appData[appData.length-1]
        }else{
            appData.ganadoliga = 0;
        }
        
        if (aplicacion.length >= 1) {
            aplicacion = aplicacion[aplicacion.length-1]

            var cantidad;

            if(!req.query.cantidad){
                cantidad = 20;
            }else{
                if(parseInt(req.query.cantidad) > 300){
                    cantidad = 300;
                }else{
                    cantidad = parseInt(req.query.cantidad);
                }
            }

            var poolliga = appData.ganadoliga;

            poolliga = poolliga*0.7

            var porcentajes = [0.4,0.2,0.15,0.05,0.04,0.04,0.04,0.03,0.03,0.02]
            var lista = [];

            var usuarios = await playerData.find({}).limit(cantidad).sort([['CupsWin', -1]]);
            
            if (usuarios.length >= 1) {
                
                for (let index = 0; index < usuarios.length; index++) {
        
                    lista[index] = parseInt(poolliga*porcentajes[index]);
                
                    if(isNaN(lista[index])){
                        lista[index] = 0;
                    }
                    
                }
                res.send(lista.toLocaleString());

            }else{
                res.send("null");
                    
            }
    
        }else{
            res.send("null");
        }
    }else{
        res.send("null");
    }

});

app.get('/api/v1/consulta/poolliga',async(req,res) => {


    var appData = await appdatos.find({});

    if (appData.length >= 1) {
        appData = appData[appData.length-1]
    }else{
        appData.ganadoliga = 0;
    }


    res.send(appData.ganadoliga+"");


});

app.get('/api/v1/consulta/playerdata/:wallet',async(req,res) => {

    var wallet =  req.params.wallet;

    var data = await playerData.find({wallet: uc.upperCase(wallet)},{_id:0,wallet:0,__v:0,UserOnline:0});

    if (data.length >= 1) {
        data = data[0];

        if(!req.query.consulta){
            res.send(data);
        }else{
            res.send(data[req.query.consulta]+"");
        }
        
    }else{

        var playernewdata = new playerData({
            wallet: uc.upperCase(wallet),
            BallonSet: "0",
            CupsWin: 0,
            DificultConfig:  "3",
            DiscountMomment:  "0",
            DuelsOnlineWins:  "0",
            DuelsPlays:  "0",
            FriendLyWins:  "0",
            FriendlyTiming: "2",
            LastDate:  "0",
            LeagueDate:  moment(Date.now()).format(formatoliga),
            LeagueOpport:  "0",
            LeagueTimer:  moment(Date.now()).format('HH:mm:ss'),
            LeaguesOnlineWins:  "0",
            MatchLose:  "0",
            MatchWins:  "0",
            MatchesOnlineWins:  "0",
            Music:  "0",
            PhotonDisconnected:  "0",
            PlaysOnlineTotal:  "0",
            PlaysTotal:  "0",
            QualityConfig:  "0",
            StadiumSet:  "0",
            TournamentsPlays:  "0",
            Version:  "mainet",
            VolumeConfig:  "0",
            Plataforma: "pc",
            GolesEnContra: "0",
            GolesAFavor: "0",
            FirstTime: "0",
            DrawMatchs: "0",
            DrawMatchsOnline: "0",
            LeaguePlay: "0",
            Analiticas: "0",
            Fxs: "0",
            UserOnline: Date.now(),
            Resolucion: "0",
            Fullscreen: "0",
            Soporte: "J&S"
            
        })

        playernewdata.save().then(()=>{
            res.send("nueva playerdata creado");
        })
            
        
    }

    
});

app.post('/api/v1/reset/leadboard',async(req,res) => {

    if( req.headers.authorization.split(' ')[1] == TOKEN ){

        //var dataUsuarios = await playerData.find({}).sort([['CupsWin', 1]]);

        await playerData.updateMany({},{ $set: {CupsWin:0 , LeagueOpport:"0"}}).exec();
        
        res.send("true");
    }else{
        res.send("false");
    }
    
});

app.post('/api/v1/update/playerdata/:wallet',async(req,res) => {

    var wallet =  req.params.wallet;
    
    if( req.headers.authorization.split(' ')[1] == TOKEN ){

        var usuario = await playerData.find({wallet: uc.upperCase(wallet)});
        
        if (usuario.length >= 1) {
            var data = usuario[0];
            
            if(req.body.clave === "BallonSet"){
                data.BallonSet = req.body.valor;
            }

            if(req.body.clave === "DificultConfig"){
                data.DificultConfig = req.body.valor;
            }

            if(req.body.clave === "LastDate"){
                data.LastDate = req.body.valor;
            }

            if(req.body.clave === "LastDate"){
                data.LastDate = req.body.valor;
            }

            if(req.body.clave === "FriendlyTiming"){
                data.FriendlyTiming = req.body.valor;
            }

            if(req.body.clave === "LeagueDate"){
                data.LeagueDate = req.body.valor;
            }

            if(req.body.clave === "Music"){
                data.Music  = req.body.valor;
            }

            if(req.body.clave === "QualityConfig"){
                data.QualityConfig  = req.body.valor;
            }
            
            if(req.body.clave === "StadiumSet"){
                data.StadiumSet  = req.body.valor;
            }

            if(req.body.clave === "Version"){
                data.Version = req.body.valor;
            }
            
            if(req.body.clave === "VolumeConfig"){
                data.VolumeConfig = req.body.valor;
            }

            if(req.body.clave === "Plataforma"){
                data.Plataforma = req.body.valor;
            }

            if(req.body.clave === "FirstTime"){
                data.FirstTime = req.body.valor;
            }

            if(req.body.clave === "Analiticas"){
                data.Analiticas = req.body.valor;
            }

            if(req.body.clave === "Fxs"){
                data.Fxs = req.body.valor;
            }

            //// las de arriba solo textos /|\

            var accionar; 
            var respuesta = "true";

                if(req.body.clave === "CupsWin"){

                    accionar = data.CupsWin;


                    switch (req.body.accion) {
                        case "sumar":
                            accionar = parseInt(accionar)+parseInt(req.body.valor);
                            break;

                        case "restar":
                            accionar = parseInt(accionar)-parseInt(req.body.valor);
                            break;

                        case "setear":
                            accionar = parseInt(req.body.valor);
                            break;

                    
                        default:
                            respuesta = "false";
                            break;
                    }

                    data.CupsWin = accionar;
                    
                }

                if(req.body.clave === "DiscountMomment"){
                    accionar = data.DiscountMomment;

                    switch (req.body.accion) {
                        case "sumar":
                            accionar = parseInt(accionar)+parseInt(req.body.valor);
                            break;

                        case "restar":
                            accionar = parseInt(accionar)-parseInt(req.body.valor);
                            break;

                        case "setear":
                            accionar = parseInt(req.body.valor);
                            break;

                    
                        default:
                            respuesta = "false";
                            break;
                    }

                    data.DiscountMomment = accionar+"";
                }

                if(req.body.clave === "DuelsOnlineWins"){
                    accionar = data.DuelsOnlineWins;

                    switch (req.body.accion) {
                        case "sumar":
                            accionar = parseInt(accionar)+parseInt(req.body.valor);
                            break;

                        case "restar":
                            accionar = parseInt(accionar)-parseInt(req.body.valor);
                            break;

                        case "setear":
                            accionar = parseInt(req.body.valor);
                            break;

                    
                        default:
                            respuesta = "false";
                            break;
                    }

                    data.DuelsOnlineWins = accionar+"";
                }

                if(req.body.clave === "DuelsPlays"){
                    accionar = data.DuelsPlays;

                    switch (req.body.accion) {
                        case "sumar":
                            accionar = parseInt(accionar)+parseInt(req.body.valor);
                            break;

                        case "restar":
                            accionar = parseInt(accionar)-parseInt(req.body.valor);
                            break;

                        case "setear":
                            accionar = parseInt(req.body.valor);
                            break;

                    
                        default:
                            respuesta = "false";
                            break;
                    }

                    data.DuelsPlays = accionar+"";
                }

                if(req.body.clave === "FriendLyWins"){
                    accionar = data.FriendLyWins;

                    switch (req.body.accion) {
                        case "sumar":
                            accionar = parseInt(accionar)+parseInt(req.body.valor);
                            break;

                        case "restar":
                            accionar = parseInt(accionar)-parseInt(req.body.valor);
                            break;

                        case "setear":
                            accionar = parseInt(req.body.valor);
                            break;

                    
                        default:
                            respuesta = "false";
                            break;
                    }

                    data.FriendLyWins = accionar+"";
                }

                if(req.body.clave === "LeagueOpport"){
                    accionar = data.LeagueOpport;

                    switch (req.body.accion) {
                        case "sumar":
                            accionar = parseInt(accionar)+parseInt(req.body.valor);
                            break;

                        case "restar":
                            accionar = parseInt(accionar)-parseInt(req.body.valor);
                            break;

                        case "setear":
                            accionar = parseInt(req.body.valor);
                            break;

                    
                        default:
                            respuesta = "false";
                            break;
                    }

                    data.LeagueOpport = accionar+"";
                }
                
                if(req.body.clave === "LeaguesOnlineWins"){
                    accionar = data.LeaguesOnlineWins;

                    switch (req.body.accion) {
                        case "sumar":
                            accionar = parseInt(accionar)+parseInt(req.body.valor);
                            break;

                        case "restar":
                            accionar = parseInt(accionar)-parseInt(req.body.valor);
                            break;

                        case "setear":
                            accionar = parseInt(req.body.valor);
                            break;

                    
                        default:
                            respuesta = "false";
                            break;
                    }

                    data.LeaguesOnlineWins = accionar+"";
                }
                
                if(req.body.clave === "MatchLose"){
                    accionar = data.MatchLose;

                    switch (req.body.accion) {
                        case "sumar":
                            accionar = parseInt(accionar)+parseInt(req.body.valor);
                            break;

                        case "restar":
                            accionar = parseInt(accionar)-parseInt(req.body.valor);
                            break;

                        case "setear":
                            accionar = parseInt(req.body.valor);
                            break;

                    
                        default:
                            respuesta = "false";
                            break;
                    }

                    data.MatchLose = accionar+"";
                }
                
                if(req.body.clave === "MatchWins"){
                    accionar = data.MatchWins;

                    switch (req.body.accion) {
                        case "sumar":
                            accionar = parseInt(accionar)+parseInt(req.body.valor);
                            break;

                        case "restar":
                            accionar = parseInt(accionar)-parseInt(req.body.valor);
                            break;

                        case "setear":
                            accionar = parseInt(req.body.valor);
                            break;

                    
                        default:
                            respuesta = "false";
                            break;
                    }

                    data.MatchWins = accionar+"";
                }
                
                if(req.body.clave === "MatchesOnlineWins"){
                    accionar = data.MatchesOnlineWins;

                    switch (req.body.accion) {
                        case "sumar":
                            accionar = parseInt(accionar)+parseInt(req.body.valor);
                            break;

                        case "restar":
                            accionar = parseInt(accionar)-parseInt(req.body.valor);
                            break;

                        case "setear":
                            accionar = parseInt(req.body.valor);
                            break;

                    
                        default:
                            respuesta = "false";
                            break;
                    }

                    data.MatchesOnlineWins = accionar+"";
                }
                
                if(req.body.clave === "PhotonDisconnected"){
                    accionar = data.PhotonDisconnected;

                    switch (req.body.accion) {
                        case "sumar":
                            accionar = parseInt(accionar)+parseInt(req.body.valor);
                            break;

                        case "restar":
                            accionar = parseInt(accionar)-parseInt(req.body.valor);
                            break;

                        case "setear":
                            accionar = parseInt(req.body.valor);
                            break;

                    
                        default:
                            respuesta = "false";
                            break;
                    }

                    data.PhotonDisconnected = accionar+"";
                }
                
                if(req.body.clave === "PlaysOnlineTotal"){
                    accionar = data.PlaysOnlineTotal;

                    switch (req.body.accion) {
                        case "sumar":
                            accionar = parseInt(accionar)+parseInt(req.body.valor);
                            break;

                        case "restar":
                            accionar = parseInt(accionar)-parseInt(req.body.valor);
                            break;

                        case "setear":
                            accionar = parseInt(req.body.valor);
                            break;

                    
                        default:
                            respuesta = "false";
                            break;
                    }

                    data.PlaysOnlineTotal = accionar+"";
                }
                
                if(req.body.clave === "PlaysTotal"){
                    accionar = data.PlaysTotal;

                    switch (req.body.accion) {
                        case "sumar":
                            accionar = parseInt(accionar)+parseInt(req.body.valor);
                            break;

                        case "restar":
                            accionar = parseInt(accionar)-parseInt(req.body.valor);
                            break;

                        case "setear":
                            accionar = parseInt(req.body.valor);
                            break;

                    
                        default:
                            respuesta = "false";
                            break;
                    }

                    data.PlaysTotal = accionar+"";
                }
                
                if(req.body.clave === "TournamentsPlays"){
                    accionar = data.TournamentsPlays;

                    switch (req.body.accion) {
                        case "sumar":
                            accionar = parseInt(accionar)+parseInt(req.body.valor);
                            break;

                        case "restar":
                            accionar = parseInt(accionar)-parseInt(req.body.valor);
                            break;

                        case "setear":
                            accionar = parseInt(req.body.valor);
                            break;

                    
                        default:
                            respuesta = "false";
                            break;
                    }

                    data.TournamentsPlays = accionar+"";
                }

                if(req.body.clave === "GolesEnContra"){
                    accionar = data.GolesEnContra;

                    switch (req.body.accion) {
                        case "sumar":
                            accionar = parseInt(accionar)+parseInt(req.body.valor);
                            break;

                        case "restar":
                            accionar = parseInt(accionar)-parseInt(req.body.valor);
                            break;

                        case "setear":
                            accionar = parseInt(req.body.valor);
                            break;

                    
                        default:
                            respuesta = "false";
                            break;
                    }

                    data.GolesEnContra = accionar+"";
                }

                if(req.body.clave === "GolesAFavor"){
                    accionar = data.GolesAFavor;

                    switch (req.body.accion) {
                        case "sumar":
                            accionar = parseInt(accionar)+parseInt(req.body.valor);
                            break;

                        case "restar":
                            accionar = parseInt(accionar)-parseInt(req.body.valor);
                            break;

                        case "setear":
                            accionar = parseInt(req.body.valor);
                            break;

                    
                        default:
                            respuesta = "false";
                            break;
                    }

                    data.GolesAFavor = accionar+"";
                }

                if(req.body.clave === "DrawMatchs"){
                    accionar = data.DrawMatchs;

                    switch (req.body.accion) {
                        case "sumar":
                            accionar = parseInt(accionar)+parseInt(req.body.valor);
                            break;

                        case "restar":
                            accionar = parseInt(accionar)-parseInt(req.body.valor);
                            break;

                        case "setear":
                            accionar = parseInt(req.body.valor);
                            break;

                    
                        default:
                            respuesta = "false";
                            break;
                    }

                    data.DrawMatchs = accionar+"";
                }

                if(req.body.clave === "DrawMatchsOnline"){
                    accionar = data.DrawMatchsOnline;

                    switch (req.body.accion) {
                        case "sumar":
                            accionar = parseInt(accionar)+parseInt(req.body.valor);
                            break;

                        case "restar":
                            accionar = parseInt(accionar)-parseInt(req.body.valor);
                            break;

                        case "setear":
                            accionar = parseInt(req.body.valor);
                            break;

                    
                        default:
                            respuesta = "false";
                            break;
                    }

                    data.DrawMatchsOnline = accionar+"";
                }

                if(req.body.clave === "LeaguePlay"){
                    accionar = data.LeaguePlay;

                    switch (req.body.accion) {
                        case "sumar":
                            accionar = parseInt(accionar)+parseInt(req.body.valor);
                            break;

                        case "restar":
                            accionar = parseInt(accionar)-parseInt(req.body.valor);
                            break;

                        case "setear":
                            accionar = parseInt(req.body.valor);
                            break;

                    
                        default:
                            respuesta = "false";
                            break;
                    }

                    data.LeaguePlay = accionar+"";
                }


            if(req.body.clave && req.body.valor){

                //console.log(data)

                data.UserOnline = Date.now();

                if( Date.now() >= parseInt(data.LeagueTimer) + 86400*1000){
                    data.LeagueOpport = "0";
                    data.LeagueTimer = Date.now();
                }

                var playernewdata = new playerData(data)
                await playernewdata.save();

                //update = await playerData.updateOne({ wallet: uc.upperCase(wallet) }, data);

                //console.log(update);

                switch (req.body.clave) {
                    case "LeagueOpport":
                        if(respuesta === "false"){
                            res.send("false");
                        }else{
                            res.send(data.LeagueOpport+"");
                        }
                        break;
                
                    default:
                        if(respuesta === "false"){
                            res.send("false");
                        }else{
                            res.send("true");
                        }
                        break;
                }

            }else{
                res.send("false");
            }

        }else{

            var playernewdata = new playerData({
                wallet: uc.upperCase(wallet),
                BallonSet: "0",
                CupsWin: 0,
                DificultConfig:  "3",
                DiscountMomment:  "0",
                DuelsOnlineWins:  "0",
                DuelsPlays:  "0",
                FriendLyWins:  "0",
                FriendlyTiming: "2",
                LastDate:  "0",
                LeagueDate:  moment(Date.now()).format(formatoliga),
                LeagueOpport:  "0",
                LeagueTimer:  moment(Date.now()).format('HH:mm:ss'),
                LeaguesOnlineWins:  "0",
                MatchLose:  "0",
                MatchWins:  "0",
                MatchesOnlineWins:  "0",
                Music:  "0",
                PhotonDisconnected:  "0",
                PlaysOnlineTotal:  "0",
                PlaysTotal:  "0",
                QualityConfig:  "0",
                StadiumSet:  "0",
                TournamentsPlays:  "0",
                Version:  "mainet",
                VolumeConfig:  "0",
                Plataforma: "PC",
                GolesEnContra: "0",
                GolesAFavor: "0",
                FirstTime: "0",
                DrawMatchs: "0",
                DrawMatchsOnline: "0",
                LeaguePlay: "0",
                Analiticas: "0",
                Fxs: "0",
                UserOnline: Date.now(),
                Resolucion: "0",
                Fullscreen: "0",
                Soporte: "J&S"
                
            })

            playernewdata.save().then(()=>{
                res.send("false");
            })
                
            
        }
    }else{
        
        res.send("false");
        
    }

    
});


app.get('/api/v1/consultar/wcsc/lista/', async(req, res, next) => {

    var usuarios;

    var cantidad

    if(!req.query.cantidad) cantidad = 10;

    cantidad = parseInt(req.query.cantidad);

    if(cantidad > 100){
        cantidad = 100;
    }
    
    usuarios = await user.find({},{password: 0, _id: 0, checkpoint:0, ingresado: 0, retirado: 0, deposit: 0, retiro:0, txs:0,email:0,reclamado:0}).limit(cantidad).sort([['balanceUSD', -1]]);

    var lista = [];
    var ex = 0;

    for (let index = 0; index < usuarios.length; index++) {

        if(!usuarios[index].wcscExchange){
            ex = 0;
        }else{
            ex = usuarios[index].wcscExchange;
        }
        
        lista[index] = {
            username: usuarios[index].username,
            activo: usuarios[index].active,
            wallet: usuarios[index].wallet,
            balance: usuarios[index].balance,
            exchange: ex
        }
        
    }

    res.send(lista);

});

async function consultarCscExchange(wallet){
    var investor = await contractExchange.methods
    .investors(wallet.toLowerCase())
    .call({ from: web3.eth.accounts.wallet[0].address });
                
    var balance = new BigNumber(investor.balance).shiftedBy(-18).toString(10);
    return balance ; 
}

app.get('/api/v1/consultar/csc/exchange/:wallet', async(req, res, next) => {

    var wallet = req.params.wallet;

    if(web3.utils.isAddress(wallet)){
        
        await user.findOne({ wallet: uc.upperCase(wallet) })
        .then(async(usuario)=>{

            var datos = {};

            if(Date.now() >= datos.checkpoint){

                datos.checkpoint =  Date.now()  + DaylyTime*1000;
                //console.log("new time Dayly: "+datos.checkpoint)
                datos.reclamado = false;

            }
            
            datos.wcscExchange = await consultarCscExchange(wallet);


            user.updateOne({_id: usuario._id}, [
                {$set: datos}
            ])
        
            res.send(datos.wcscExchange+'');

        })
        .catch(async()=>{
            res.send("0");
        })  
    }else{
        res.send("0");
    }

    
 
 });

 app.get('/api/v1/consultar/csc/cuenta/:wallet', async(req, res, next) => {

    var wallet = req.params.wallet;

    var saldo = await contractToken.methods
    .balanceOf(wallet.toLowerCase())
    .call({ from: web3.eth.accounts.wallet[0].address });

    saldo = new BigNumber(saldo).shiftedBy(-18).toString(10);
    
    res.send(saldo+"");
    
 
 });


app.post('/api/v1/ban/unban/:wallet',async(req,res) => {

    var wallet =  req.params.wallet.toLowerCase();

    req.body.active
    req.body.ban 

    if( req.headers.authorization.split(' ')[1] == TOKEN2  && web3.utils.isAddress(wallet)){

        usuario = await user.find({ wallet: uc.upperCase(wallet) });

        if (usuario.length >= 1) { 
            var datos = usuario[0];

            if(req.body.active){
                datos.active = true;
            }
            
            if(req.body.ban){
                datos.active = false;
            }
            
            //datos.wcscExchange = await consultarCscExchange(wallet);

            var nuevoUsuario = new user(datos)
            await nuevoUsuario.save();

            //update = await user.updateOne({ wallet: uc.upperCase(wallet) }, datos);
            //console.log(" # "+uc.upperCase(wallet));
            res.send({activo: datos.active});
    
        }else{
            console.log("usuario creado al hacer ban o quitar"+wallet)
            var users = new user({
                wallet: uc.upperCase(wallet),  
                email: "",
                password: "",
                username: "",   
                active: true,
                payAt: Date.now(),
                checkpoint: 0,
                reclamado: false,
                balance: 0,
                balanceUSD: 0,
                ingresado: 0,
                retirado: 0,
                deposit: [],
                retiro: [],
                txs: [],
                pais: "null",
                imagen: imgDefault,
                wcscExchange: 0
            });
    
            users.save().then(()=>{
                console.log("Usuario creado exitodamente");
                
            })
                
            res.send("false");
            
        }

    }else{
        res.send("false");
    }
		
    
});


app.post('/api/v1/copas/asignar/:wallet',async(req,res) => {

    var wallet =  req.params.wallet.toLowerCase();

    var copas = parseInt(req.body.copas);

    console.log("Copas: +"+copas+" wallet:"+wallet)
    
    if( req.headers.authorization.split(' ')[1] == TOKEN && web3.utils.isAddress(wallet)){

        playerdatas.updateOne({ wallet: uc.upperCase(wallet) },[
            {$set:{CupsWin: {$sum:["$CupsWin",copas]}}}
        ]).then(()=>{
            res.send("true");
        })    
    
    }else{
        
        res.send("false");

        
    }

		
});

app.post('/api/v1/copas/quitar/:wallet',async(req,res) => {

    var wallet =  req.params.wallet.toLowerCase();

    var copas = parseInt(req.body.copas);

    console.log("Copas: -"+copas+" wallet:"+wallet)
    
    if( req.headers.authorization.split(' ')[1] == TOKEN && web3.utils.isAddress(wallet)){

        playerdatas.updateOne({ wallet: uc.upperCase(wallet) },[
            {$set:{CupsWin: {$subtract:["$CupsWin",copas]}}}
        ]).then(()=>{
            res.send("true");
        })    
     
    
    }else{
        
        res.send("false");

        
    }
		
    
});


app.listen(port, ()=> console.log('Escuchando Puerto: ' + port))
