// Declaração de constantes e importação das dependências necessárias
const mysql = require('mysql2'); // Biblioteca para conexão com o banco de dados MySQL
const express = require('express'); // Framework web para Node.js
const bodyParser = require('body-parser'); // Middleware para análise de corpos de requisição

// Criação de uma instância do Express
const app = express();

// Define que os arquivos estáticos devem ser buscados na pasta 'public'
app.use(express.static('public'));

// Configuração da conexão com o banco de dados MySQL
const connection = mysql.createConnection({
    host: 'localhost', // Endereço do banco de dados
    user: 'root', // Nome de usuário
    password: 'root', // Senha
    database: 'agenciadeviagens', // Nome do banco de dados
    port: 3306 // Porta do banco de dados
});

// Estabelece a conexão com o banco de dados e emite uma mensagem indicando seu status
connection.connect(function (err) {
    if (err) {
        console.error('Erro ', err);
        return
    }
    console.log("Conexão ok")
});

// Middleware para análise de corpos de requisição
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Rota para a página default
app.get("/", function (req, res) {
    res.sendFile(__dirname + "/Login.html")
});

// Rota para a página principal
app.get("/menu", function (req, res) {
    res.sendFile(__dirname + "/Menu.html")
});

// rota pra adicionar viagens
app.get("/Add", function (req, res) {
    res.sendFile(__dirname + "/AddViagens.html")
});

//Rota para a cadastrar cliente
app.post('/cadastrar', function (req, res) {
    const nome = req.body.nome;
    const email = req.body.email;
    const telefone = req.body.telefone;


    const values = [nome, email, telefone];
    const insert = "INSERT INTO clientes (nome, email, telefone) VALUES (?,?,?)"

    connection.query(insert, values, function (err, result) {
        if (!err) {
            console.log("Dados inseridos com sucesso!");
            res.redirect('/menu');
        } else {
            console.log("Não foi possível inserir os dados ", err);
            res.send("Erro!")
        }
    })

});


//cadastrar viajens
app.post('/cadastro-viagem', function (req, res) {
    const destino = req.body.destino;
    const data = req.body.data;
    const preco = req.body.preco;
    const vagas = req.body.vagas;

    const values = [destino, data, preco, vagas];
    const insert = "INSERT INTO viagens (destino, data, preco, vagas) VALUES (?,?,?,?)"

    connection.query(insert, values, function (err, result) {
        if (!err) {
            console.log("Dados da viagem inseridos com sucesso!");
            res.redirect('/registro');
        } else {
            console.log("Não foi possível inserir os dados ", err);
            res.send("Erro!")
        }
    })

});

app.get('/registro', function (req, res) {
    const registro = "SELECT * FROM viagens";

    connection.query(registro, function (err, rows) {
        if (!err) {
            console.log("Consulta realizada com sucesso!");
            res.send(`
                <html>
                <head>
                    <title>Relatório de Estoque</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-image: url('https://horabrasilia.com.br/wp-content/uploads/2020/10/aeroportos-1.jpg');
                            background-size: cover;
                            background-position: center;
                            margin: 0;
                            padding: 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                        }

                        .container {
                            background: rgba(255, 255, 255, 0.95);
                            padding: 40px;
                            border-radius: 12px;
                            width: 90%;
                            max-width: 1000px;
                            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
                        }

                        h1 {
                            text-align: center;
                            color: #007BFF;
                            margin-bottom: 20px;
                        }

                        table {
                            width: 100%;
                            border-collapse: collapse;
                            margin-top: 20px;
                        }

                        th, td {
                            padding: 12px;
                            border-bottom: 1px solid #ddd;
                            text-align: center;
                        }

                        th {
                            background-color: #007BFF;
                            color: white;
                        }

                        td a {
                            margin: 0 5px;
                            text-decoration: none;
                            color: #007BFF;
                            font-weight: bold;
                        }

                        td a:hover {
                            text-decoration: underline;
                        }

                        .voltar {
                            text-align: center;
                            margin-top: 30px;
                        }

                        .voltar a {
                            text-decoration: none;
                            color: #007BFF;
                            font-weight: bold;
                            font-size: 16px;
                        }

                        .voltar a:hover {
                            text-decoration: underline;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1>Relatório de Estoque</h1>
                        <table>
                            <tr>
                                <th>Código</th>
                                <th>Destino</th>
                                <th>Data</th>
                                <th>Preço</th>
                                <th>Vagas</th>
                                <th>Ações</th>
                            </tr>
                            ${rows.map(row => `
                                <tr>
                                    <td>${row.id}</td>
                                    <td>${row.destino}</td>
                                    <td>${row.data}</td>
                                    <td>${row.preco}</td>
                                    <td>${row.vagas}</td>
                                    <td>
                                        <a href="/excluir/${row.id}">Excluir</a> 
                                        <a href="/editar/${row.id}">Editar</a>
                                    </td>
                                </tr>
                            `).join('')}
                        </table>
                        <div class="voltar">
                            <a href="/menu">Voltar</a>
                        </div>
                    </div>
                </body>
                </html>
            `);
        } else {
            console.log("Erro no relatório de estoque", err);
            res.send("Erro");
        }
    });
});

app.get('/excluir/:id', function (req, res) {
    const id = req.params.id;

    connection.query('DELETE FROM viagens WHERE id = ?', [id], function (err, result) {
        if (err) {
            console.error('Erro ao excluir esta viagem: ', err);
            res.status(500).send('erro interno ao excluir esta viagem.');
            return;
        }

        console.log("Viagem excluida com sucesso!");
        res.redirect('/registro');
    })
})

app.get('/editar/:id', function (req, res) {
    const id = req.params.id; // Obtém o ID do produto a ser editado da URL
    const select = "SELECT * FROM viagens WHERE id = ?";

    connection.query(select, [id], function (err, rows) {
        if (!err) {
            console.log("viagem encontrada com sucesso!");
            res.send(`
                <html>
                    <head>
                        <title> Editar produto </title>
                       <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-image: url('https://horabrasilia.com.br/wp-content/uploads/2020/10/aeroportos-1.jpg');
                            background-size: cover;
                            background-position: center;
                            margin: 0;
                            padding: 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                            flex-direction: column;
                        }

                        form {
                            background: white;
                            padding: 40px;
                            border-radius: 15px;
                            width: 90%;
                            max-width: 500px;
                            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
                            text-align: center;
                        }

                        .titulo-circulo {
                            background-color: white;
                            border-radius: 50%;
                            padding: 20px 30px;
                            display: inline-block;
                            margin-bottom: 30px;
                            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
                        }

                        h1 {
                            color: #007BFF;
                            margin: 0;
                            font-size: 24px;
                        }

                        label {
                            font-weight: bold;
                            color: #333;
                            display: block;
                            text-align: left;
                            margin-bottom: 5px;
                        }

                        input[type="text"],
                        input[type="date"],
                        input[type="number"] {
                            width: 100%;
                            padding: 10px;
                            margin-bottom: 20px;
                            border-radius: 8px;
                            border: 1px solid #ccc;
                            font-size: 15px;
                            box-sizing: border-box;
                        }

                        input[type="submit"] {
                            width: 100%;
                            background-color: #007BFF;
                            color: white;
                            border: none;
                            padding: 12px;
                            font-size: 16px;
                            border-radius: 8px;
                            cursor: pointer;
                            transition: background-color 0.3s;
                        }

                        input[type="submit"]:hover {
                            background-color: #0056b3;
                        }

                        .voltar {
                            text-align: center;
                            margin-top: 20px;
                        }

                        .voltar a {
                            text-decoration: none;
                            color: #007BFF;
                            font-weight: bold;
                        }

                        .voltar a:hover {
                            text-decoration: underline;
                        }
                    </style>
                    </head>
                    <body>
                        <h1>Editar Viagem</h1>
                        <form action="/editar/${id}" method="POST">
                            <label for="destino">Destino:</label><br>
                            <input type="text" name="destino" value="${rows[0].destino}"><br><br>
                            <label for="data">Data:</label><br>
                            <input type="date" name="data" value="${rows[0].data}"><br><br>
                            <label for="preco">Preço:</label><br>
                            <input type="text" name="preco" value="${rows[0].preco}"><br><br>
                            <label for="vagas">Vagas:</label><br>
                            <input type="number" name="vagas" value="${rows[0].vagas}"><br><br>
                            <input type="submit" value="Salvar">
                        </form>
                    </body>
                </html>`);
        } else {
            console.log("Erro ao buscar o viagem ", err);
            res.send("Erro")
        }
    });

});

app.post('/editar/:id', function (req, res) {
    const id = req.params.id;
    const destino = req.body.destino;
    const data = req.body.data;
    const preco = req.body.preco;
    const vagas = req.body.vagas;

    const update = "UPDATE viagens SET destino = ?, data = ?, preco = ?, vagas = ?  WHERE id = ?";

    connection.query(update, [destino, data, preco, vagas, id], function (err, result) {
        if (!err) {
            console.log("viagem editada com sucesso!");
            res.redirect('/registro');
        } else {
            console.log("Erro ao editar o produto ", err);
            res.send("Erro")
        }
    });
});


// Inicia o servidor na porta 8083
app.listen(8083, function () {
    console.log("Servidor rodando na url http://localhost:8083")
})
