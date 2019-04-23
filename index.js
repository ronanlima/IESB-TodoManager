const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const SEGREDO = 'euvoupracasa';
const taskDAO = require('./taskDAO');

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
    taskDAO.insert(task, (err, data) => {
        if (err) {
            response.status(500).send(err);
        } else {
            response.status(201).send(data);
        }
    });
});

app.get('/tasks', (request, response) => {
    taskDAO.listAll((err, data) => {
        if (err) {
            response.status(500).send(err);
        } else if (task) {
            response.status(200).send(data);
        }
    });
});

app.get('/tasks/:taskId', (request, response) => {
    taskDAO.findTaskById(request.params.id, (err, task) => {
        if (err) {
            response.status(500).send(err);
        } else {
            response.status(200).send(task);
        }
    });
    if (task) {
        response.status(200);
        response.send(task);
    } else if (err) {
        response.status(500).send(err);
    } else {
        response.status(404);
        response.send();
    }
});

app.put('/tasks/:taskId', (request, response) => {
    const body = request.body;
    const task = {
        id: request.params.taskId,
        title: body.title,
        description: body.description,
        isDone: body.isDone,
        isPriority: body.isPriority
    }
    taskDAO.insert(task, (err, data) => {
        if (err) {
            response.status(500).send(err);
        } else {
            response.status(200).send(data);
        }
    });
});

app.delete('/tasks/:taskId', (request, response) => {
    taskDAO.remove(request.params.taskId, (err, data) => {
        if (err) {
            response.status(500).send(err);
        } else {
            response.status(200).send(data);
        }
    });
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

taskDAO.init((err, data) => {
    if (err) {
        console.log('Servidor não iniciado por erro.', err);
    } else {
        app.listen(3000, () => {
            console.log('Servidor iniciado');
        });
    }
});