const express = require('express')
const fs = require('fs')

const app = express()
const PORT = 3000

app.use(express.json())

function lerProdutos() {
  const dados = fs.readFileSync('./data/produtos.json', 'utf-8')
  return JSON.parse(dados)
}

function salvarProdutos(produtos) {
  fs.writeFileSync('./data/produtos.json', JSON.stringify(produtos, null, 2))
}

app.get('/', (req, res) => {
  res.send('API de Estoque funcionando!')
})

app.get('/produtos', (req, res) => {
  const produtos = lerProdutos()
  res.json(produtos)
})

app.get('/produtos/:id', (req, res) => {
  const id = Number(req.params.id)
  const produtos = lerProdutos()

  const produto = produtos.find(p => p.id === id)

  if (!produto) {
    return res.status(404).json({ erro: 'Produto não encontrado' })
  }

  res.json(produto)
})

app.post('/produtos', (req, res) => {
  const { nome, descricao, preco, quantidade, categoria } = req.body

  if (!nome || preco === undefined) {
    return res.status(400).json({ erro: 'Nome e preço são obrigatórios' })
  }

  if (preco <= 0) {
    return res.status(400).json({ erro: 'Preço deve ser maior que 0' })
  }

  if (quantidade !== undefined && quantidade < 0) {
    return res.status(400).json({ erro: 'Quantidade deve ser >= 0' })
  }

  const produtos = lerProdutos()

  const novoProduto = {
    id: produtos.length > 0 ? produtos[produtos.length - 1].id + 1 : 1,
    nome,
    descricao,
    preco,
    quantidade,
    categoria
  }

  produtos.push(novoProduto)

  salvarProdutos(produtos)

  res.status(201).json(novoProduto)
})

app.put('/produtos/:id', (req, res) => {
  const id = Number(req.params.id)
  const { nome, descricao, preco, quantidade, categoria } = req.body

  const produtos = lerProdutos()

  const index = produtos.findIndex(p => p.id === id)

  if (index === -1) {
    return res.status(404).json({ erro: 'Produto não encontrado' })
  }

  produtos[index] = {
    ...produtos[index],
    nome,
    descricao,
    preco,
    quantidade,
    categoria
  }

  salvarProdutos(produtos)

  res.json(produtos[index])
})

app.delete('/produtos/:id', (req, res) => {
  const id = Number(req.params.id)

  const produtos = lerProdutos()

  const novoArray = produtos.filter(p => p.id !== id)

  if (novoArray.length === produtos.length) {
    return res.status(404).json({ erro: 'Produto não encontrado' })
  }

  salvarProdutos(novoArray)

  res.json({ mensagem: 'Produto removido com sucesso' })
})

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`)
})