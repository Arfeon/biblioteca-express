const sql = require('mssql'); //Creem un obj conector mssql
const express = require('express'); //Creem un obj del servei de express
var app = express(); //Instanciem express()
const bodyParser = require("body-parser"); //Creem un nou obj de body-parser

// Body Parser Middleware
app.use(bodyParser.json());

//Capçeleres de les consultes que acceptem i els seus verbs HTTP
app.use(function(req, res, next) { //amb app.use el que fem es que express per qualsevol ruat entri primer aqui afegeigi les capçaleres i
    //Amb next passem al següent mètode que es cridi de la URL /<endpoint>
    //Enabling CORS 
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT,DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, contentType,Content-Type, Accept, Authorization");
    next();
});
//Configuracions del nostre servidor de SQL
const config = {
        user: "admin", //default is sa
        password: "Es2zzkh27!",
        server: "DESKTOP-3U87SO9\\SQLEXPRESS", // for local machine
        database: "INTERACTIU", // name of database
        options: {
            enableArithAbort: false
        }
    }
    //Funcio que rebra un reques HTTP una Resposta i una Query, es conectarà al servidor la executara i retornara els valors
function executeQuery(req, res, query) {
    var sqlConnection = sql.connect(config, (err) => { //Instanciem la conexió a la base de daes
        if (err) { //Si tenim err el mostrem
            console.log(err);
        } else { //Si no tenim error ens conectem
            console.log("Conectado a la Base de datos: " + config.database);
            var request = new sql.Request(); //Creem un nou Request per el servidor de SQL
            request.query(query, (err, result) => { //Passem la query al servidor i amb una funcio anònima li diem que el que retorni serà err i result, per tal de poder-los
                //tractar, si l'executa i doian erro fem una cosa sinó amb el resultat en faem un altre que sera retornar-l
                if (err) {
                    console.log(query);
                    console.log(err);
                } else {

                    console.log(result.recordset);
                    res.send(result.recordset); //Retornem les dades que sera el resultset
                }

                sqlConnection.close(); //Tenquem conexió del servidor per tal de que espuguin seguir conectant
            });

        }
    });
}



app.listen(3000, () => console.log("express server is running")); //Encenem Express i li diem que escolti al port 3000
//Gets Biblioteca
app.get('/api/bibliotecas', (req, res) => { //Aqui creem un Endpoint per petcio GET a URL /api/bibliotecas que executa un select
    var query = "select * from Bibliotecas";
    executeQuery(req, res, query);
});
app.get('/api/bibliotecas/:id', (req, res) => {
        var query = "select * from Bibliotecas WHERE biblioteca_id=" + req.params.id;
        executeQuery(req, res, query);
    })
    //POST Bibliotecas
app.post("/api/bibliotecas", function(req, res) {
    console.log(req.body);
    var query = "INSERT INTO Bibliotecas (biblioteca_id,nombre,direccion) VALUES (" + req.body.biblioteca_id + "," + "'" + req.body.nombre + "'" + "," + "'" + req.body.direccion + "'" + ")";
    //var query = "INSERT INTO Bibliotecas (biblioteca_id,nombre,direccion) VALUES ( 3,'La Falsa','Calle Falsa')";
    console.log("Insert: " + query);
    executeQuery(req, res, query);
});
//PUT Bibliotecas
app.put('/api/bibliotecas/:id', function(req, res) {
    var query = "UPDATE Bibliotecas SET nombre= " + "'" + req.body.nombre + "'" + " , direccion=  " + "'" + req.body.direccion + "'" + "  WHERE biblioteca_id= " + req.body.biblioteca_id;
    executeQuery(req, res, query);
});
//DELETE Bbilbiotecas
app.delete("/api/bibliotecas/:id", function(req, res) {
    console.log("Estem al eliminar de express: " + req.params.id);
    var query = "DELETE FROM Bibliotecas WHERE biblioteca_id=" + req.params.id;
    console.log(query);
    executeQuery(req, res, query);
});

//Get Categorias
app.get('/api/categorias', (req, res) => { //Aqui creem un Endpoint per petcio GET a URL /api/categorias que executa un select
    var query = "select * from Categorias";
    executeQuery(req, res, query);
});
app.get('/api/categorias/:id', function(req, res) {
    var query = "SELECT *  FROM Categorias WHERE categoria_id=" + req.params.id;
    executeQuery(req, res, query);
});
app.post('/api/categorias', (req, res) => {
    var query = "INSERT INTO Categorias (categoria_id,nombre) VALUES (" + req.body.categoria_id + ",'" + req.body.nombre + "'" + ")";
    executeQuery(req, res, query);
});
app.put('/api/categorias/:id', (req, res) => {
    var query = "UPDATE Categorias SET nombre=" + "'" + req.body.nombre + "'" + " WHERE categoria_id=" + req.params.id;
    console.log("Modificando Categoria: " + query);
    executeQuery(req, res, query);
});
app.delete('/api/categorias/:id', (req, res) => {
    var query = "DELETE FROM Categorias WHERE categoria_id=" + req.params.id;
    executeQuery(req, res, query);
});

//Get Libros
app.get('/api/libros', (req, res) => { //Aqui creem un Endpoint per petcio GET a URL /api/libros que executa un select
    var query = "select Libros.libro_id,Libros.nombre,Libros.biblioteca_id,Libros.categoria_id,Categorias.nombre as categoria_nombre,Bibliotecas.nombre as biblioteca" +
        " from Libros join Categorias on Libros.categoria_id=Categorias.categoria_id" +
        " join Bibliotecas ON Bibliotecas.biblioteca_id=Libros.biblioteca_id" +
        " order by Biblioteca ASC";
    console.log(query);
    executeQuery(req, res, query);
});
app.get('/api/libros-alquileres', (req, res) => { //Aqui creem un Endpoint per petcio GET a URL /api/libros que executa un select
    var query = "select Libros.libro_id,Libros.nombre,Libros.biblioteca_id,Libros.categoria_id,Categorias.nombre as categoria_nombre,Bibliotecas.nombre as biblioteca" +
        "AlquilerUsuarioLibro.fecha_alquiler,AlquilerUsuarioLibro.fecha_devolucion"
    " from Libros join Categorias on Libros.categoria_id=Categorias.categoria_id" +
    " join Bibliotecas ON Bibliotecas.biblioteca_id=Libros.biblioteca_id" +
    "Left join AlquilerUsuarioLibro On AlquilerUsuarioLibro.libro_id == Libros.libro_id"
    " order by Biblioteca ASC";
    console.log(query);
    executeQuery(req, res, query);
});
app.get('/api/libros/:id', (req, res) => {
    var query = "select Libros.libro_id,Libros.nombre,Libros.biblioteca_id,Libros.categoria_id,Categorias.nombre as categoria_nombre,Bibliotecas.nombre as biblioteca" +
        " from Libros join Categorias on Libros.categoria_id=Categorias.categoria_id" +
        " join Bibliotecas ON Bibliotecas.biblioteca_id=Libros.biblioteca_id" +
        " WHERE Libros.libro_id=" + req.params.id;
    executeQuery(req, res, query);
});
app.post('/api/libros', (req, res) => {
    var query = "INSERT INTO Libros (libro_id,nombre,biblioteca_id,categoria_id) VALUES (" + req.body.libro_id + ",'" + req.body.nombre + "'," + req.body.biblioteca_id + "," + req.body.categoria_id + ")";
    executeQuery(req, res, query);
});
app.put('/api/libros/:id', (req, res) => {
    var query = "UPDATE Libros SET nombre=" + "'" + req.body.nombre + "', biblioteca_id=" + req.body.biblioteca_id + ",categoria_id=" + req.body.categoria_id + "WHERE libro_id=" + req.params.id;
    executeQuery(req, res, query);
});
app.delete('/api/libros/:id', (req, res) => {
    var query = "DELETE FROM Libros WHERE libro_id=" + req.params.id;
    executeQuery(req, res, query);
});
//Get Usuarios
app.get('/api/usuarios', (req, res) => { //Aqui creem un Endpoint per petcio GET a URL /api/usuarios que executa un select
    var query = "select * from Usuarios";
    executeQuery(req, res, query);
});
app.get('/api/usuarios/:id', (req, res) => {
    var query = "SELECT * FROM Usuarios WHERE Usuarios.usuario_id=" + req.params.id;
    executeQuery(req, res, query);
});
app.post('/api/usuarios', (req, res) => {
    var query = "INSERT INTO Usuarios(usuario_id,nombre,apellidos) VALUES(" + req.body.usuario_id + ",'" + req.body.nombre + "','" + req.body.apellidos + "')";
    executeQuery(req, res, query);
});
app.put('/api/usuarios/:id', (req, res) => {
    var query = "UPDATE Usuarios SET nombre='" + req.body.nombre + "',apellidos='" + req.body.apellidos + "' WHERE Usuarios.usuario_id=" + req.params.id;
    executeQuery(req, res, query);
});
app.delete('/api/usuarios/:id', (req, res) => {
    var query = "DELETE FROM Usuarios WHERE Usuarios.usuario_id=" + req.params.id;
    executeQuery(req, res, query);
});
//Get Alquileres
app.get('/api/alquileres', (req, res) => { //Aqui creem un Endpoint per petcio GET a URL /api/alquileres que executa un select
    //es pot fer servir un format per obtenir les dates ja com volem o fer-ho al client 
    //select FORMAT (AlquilerUsuarioLibro.fecha_alquiler, 'dd/MM/yyyy ') as fecha_alquiler, FORMAT (AlquilerUsuarioLibro.fecha_devolucion, 'dd/MM/yyyy ') as fecha_devolucion
    var query = "select AlquilerUsuarioLibro.alquiler_id, FORMAT (AlquilerUsuarioLibro.fecha_alquiler, 'yyyy-MM-dd ') as fecha_alquiler, FORMAT (AlquilerUsuarioLibro.fecha_devolucion, 'yyyy-MM-dd ') as fecha_devolucion,AlquilerUsuarioLibro.libro_id,AlquilerUsuarioLibro.usuario_id, Libros.nombre as libro_nombre,Usuarios.nombre as usuario_nombre " +
        "from AlquilerUsuarioLibro " +
        "Join Libros ON Libros.libro_id=AlquilerUsuarioLibro.libro_id " +
        "Join Usuarios ON Usuarios.usuario_id=AlquilerUsuarioLibro.usuario_id";
    executeQuery(req, res, query);
});
app.get('/api/alquileres/:id', (req, res) => {
    var query = "select AlquilerUsuarioLibro.alquiler_id,FORMAT (AlquilerUsuarioLibro.fecha_alquiler, 'yyyy-MM-dd ') as fecha_alquiler, FORMAT (AlquilerUsuarioLibro.fecha_devolucion, 'yyyy-MM-dd ') as fecha_devolucion,AlquilerUsuarioLibro.libro_id,AlquilerUsuarioLibro.usuario_id, Libros.nombre as libro_nombre,Usuarios.nombre as usuario_nombre " +
        "from AlquilerUsuarioLibro " +
        "Join Libros ON Libros.libro_id=AlquilerUsuarioLibro.libro_id " +
        "Join Usuarios ON Usuarios.usuario_id=AlquilerUsuarioLibro.usuario_id " +
        "WHERE AlquilerUsuarioLibro.alquiler_id=" + req.params.id;
    executeQuery(req, res, query);
});
app.post('/api/alquileres', (req, res) => {
    var query = "INSERT INTO AlquilerUsuarioLibro(fecha_alquiler,fecha_devolucion,libro_id,usuario_id) VALUES('" + req.body.fecha_alquiler + "','" + req.body.fecha_devolucion + "'," + req.body.libro_id + "," + req.body.usuario_id + ")";
    executeQuery(req, res, query);
});
app.put('/api/alquileres/:id', (req, res) => {
    var query = "UPDATE AlquilerUsuarioLibro SET fecha_alquiler='" + req.body.fecha_alquiler + "',fecha_devolucion='" + req.body.fecha_devolucion + "',usuario_id=" + req.body.usuario_id + ",libro_id=" + req.body.libro_id + " WHERE alquiler_id=" + req.params.id;
    executeQuery(req, res, query);
});
app.delete('/api/alquileres/:id', (req, res) => {
    var query = "DELETE FROM AlquilerUsuarioLibro WHERE alquiler_id=" + req.params.id;
    executeQuery(req, res, query);
});