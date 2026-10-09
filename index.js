const express = require('express');
const  route  = require('./route');
const mongoos = require('./db/mongoos');
const app = express()
const port = 3000

mongoos()

// medal ware
app.use(express.json())

app.use(route)


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})