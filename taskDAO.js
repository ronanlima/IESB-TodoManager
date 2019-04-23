const AWS = require('./AWSProvider');
const uuid = require('uuid');

const dynamoDB = new AWS.DynamoDB();

const init = (callback) => {
    dynamoDB.listTables({}, (err, data) => {
        if (err) {
            callback(err);
        } else {
            if (data.TableNames.indexOf('Tasks') == -1) {
                dynamoDB.createTable({
                    TableName: 'Tasks',
                    AttributeDefinitions: [
                        {AttributeName: 'id', AttributeType: 'S'},
                    ],
                    KeySchema: [
                        {AttributeName: 'id', KeyType: 'HASH'},
                    ],
                    ProvisionedThroughput: {
                        ReadCapacityUnits: 1,
                        WriteCapacityUnits: 1
                    },
                }, (err, data) => {
                    callback(err, data);
                })
            } else {
                callback(err, {message: 'Ok'});
            }
        }
    });
}

const insert = (task, callback) => {
    const id = task.id || uuid;
    dynamoDB.putItem({
        TableName: 'Tasks',
        Item: {
            "id": {S: id},
            "title": {S: task.title},
            "description": {S: task.description},
            "isPriority": {BOOL: task.isPriority},
            "isDone": {BOOL: task.isDone}
        }
    }, (err, data) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, {
                id,
                title: task.title,
                description: task.description,
                isPriority: task.isPriority,
                isDone: task.isDone
            });
        }
    });
}

const listAll = (callback) => {
    dynamoDB.scan({TableName: 'Tasks'}, (err, data) => {
        if (err) {
            callback(err, null);
        } else {
            const list = [];
            data.Items.forEach(item => {
                const task = {
                    id: item.id.S,
                    title: item.title.S,
                    description: item.description.S,
                    isDone: item.isDone.BOOL,
                    isPriority: item.isPriority.BOOL
                }
                list.push(task);
            });
            callback(null, list);
        }
    });
}

const findTaskById = (id, callback) => {
    dynamoDB.getItem({
        TableName: 'Tasks',
        Key: {
            "id": {S: id}
        }
    }, (err, data) => {
        if (err) {
            callback(err, null);
        } else {
            const item = data.Item;
            var task = null;
            if (item) {
                task = {
                    id: item.id.S,
                    title: item.title.S,
                    description: item.description.S,
                    isDone: item.isDone.BOOL,
                    isPriority: item.isPriority.BOOL
                }
            }
            callback(null, task);
        }
    });
}

const remove = (id, callback) => {
    dynamoDB.deleteItem({
        TableNames: 'Tasks',
        Key: {
            "id": {S: id}
        }
    }, (err, data) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, {message: 'Deleted'});
        }
    });
}

module.exports = {insert, listAll, findTaskById, remove, init}