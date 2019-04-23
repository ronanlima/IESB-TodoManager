const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const SEGREDO = 'euvoupracasa';

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

function cobrarTokenJwt(req, resp, next) {
    if (req.url == '/login') {
        next();
    }

    var token = req.headers['x-access-token'];
    try {
        var decodificado = jwt.verify(token, SEGREDO);
        next();
    } catch(e) {
        resp.status(500).send({message: 'Token inválido'});
    }
}
app.use(cobrarTokenJwt);

app.get('/', (req, res) => res.send('To Do Manager'));

var tasks = [];

app.post('/tasks', (request, response) => {
    const body = request.body;
    const task = {
        id: uuid(),
        body: body.title,
        description: body.description,
        isDone: body.isDone,
        isPriority: body.isPriority
    };
    tasks.push(task);
    response.status(201);
    response.send(task);
});

app.get('/tasks', (request, response) => {
    response.status(200).send(tasks);
});

app.get('/tasks/:taskId', (request, response) => {
    const task = tasks.find(t => t.id == request.params.taskId);
    if (task) {
        response.status(200);
        response.send(task);
    } else {
        response.status(404);
        response.send();
    }
});

app.put('/tasks/:taskId', (request, response) => {
    const {body} = request;
    const task = tasks.find(t => t.id == request.params.taskId);
    if (task) {
        task.title = body.title;
        task.description = body.description;
        task.isDone = body.isDone;
        task.isPriority = body.isPriority;
        response.status(200).send(task);
    } else {
        response.status(404).send();
    }
});

app.delete('/tasks/:taskId', (request, response) => {
    const task = tasks.find(t => t.id == request.params.taskId);
    if (task) {
        tasks = tasks.filter(t => t.id != request.params.taskId);
        response.status(200).send(task);
    } else {
        response.status(404).send();
    }
});

app.post('/login', (request, response) => {
    var body = request.body;
    if (body.username == 'usuario' && body.password == 'teste123') {
        var token = jwt.sign({username: 'usuario', role: 'admin'}, SEGREDO, {expiresIn: '1h'});
        response.status(200).send({auth: true, token});
    } else {
        response.status(403).send({auth: false, message: 'usuário inválido'});
    }
});

app.listen(3000, () => console.log('Server started on port 3000'));
