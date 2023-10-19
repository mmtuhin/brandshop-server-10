const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 4444

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.mojgkap.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const brandCollection = client.db('popcornDB').collection('brand')
    const productCollection = client.db('popcornDB').collection('product')

    //Get all brands API
    app.get('/brand', async(req, res) => {
      const cursor = brandCollection.find()
      const result = await cursor.toArray()
      res.send(result)
    })

    //add brand API
    app.post('/brand', async(req, res) => {
      const brand = req.body;
      console.log(brand);
     const result = await brandCollection.insertOne(brand)
      res.send(result)
    })

    //Add Product
    app.post('/product', async(req, res) => {
      const product = req.body;
      console.log(product);
      const result = await productCollection.insertOne(product)
      res.send(result)

    })
    //get product by product Brand
    app.get('/brandProducts/:brandName', async(req, res) => {
      const brandName = req.params.brandName
      const query = { productBrand: brandName };
      const cursor = productCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
   //await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Popcorn-play server is running.')
})

app.listen(port, () => {
  console.log(`Example app listening on port: ${port}`)
})