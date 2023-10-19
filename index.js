const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
    const cartCollection = client.db('popcornDB').collection('cart')

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

    //Upcoming product API
    app.get('/upcoming', async(req, res) => {
      const upcoming = req.body
      const query = { productStatus: "Upcoming" };
      const cursor = productCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })

    //Trending Product Api
    app.get('/trending', async(req, res) => {
      //const trending = req.body
      const query = {
        $expr: {
          $gt: [{ $toDouble: "$productRating" }, 5]
        }
      };
      const cursor = productCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })


    //Add product to Cart 
    app.post('/cart', async(req, res) => {
      const cartProduct = req.body;
      console.log(cartProduct);
      const existingProduct = await cartCollection.findOne({ _id: cartProduct._id });
      if (!existingProduct){
        const result = await cartCollection.insertOne(cartProduct)
        res.send(result)
      }
      else{
        res.send({ message: 'Product already added to the cart.' })
      }
      
    })

    //get All Cart Data of a user(Based on Email)
    app.get('/myCart/:email', async(req, res) => {
      const email = req.params.email
      const query = {email: email}
      const cursor = cartCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })

    //delete a product from cart
    app.delete('/cart/:productId', async(req, res) => {
      const productId = req.params.productId;
      console.log(productId);
      const query = {_id: productId};
      const result = await cartCollection.deleteOne(query)
      res.send(result)
    })

    //get products by product Brand
    app.get('/brandProducts/:brandName', async(req, res) => {
      const brandName = req.params.brandName
      const query = { productBrand: brandName };
      const cursor = productCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })

    //Get single product by product ID
    app.get('/productDetails/:productId', async(req, res) => {
      const productId = req.params.productId
      const query = { _id: new ObjectId(productId) };
      const cursor = productCollection.find(query)
      const result = await cursor.toArray()
      res.send(result)
    })

    //Get the product for updating
    app.get('/updateProduct/:productId', async (req, res) => {
      const productId = req.params.productId;
      const query = {_id: new ObjectId(productId)}
      const result = await productCollection.findOne(query)
      res.send(result)
    })

    //update Product
    app.put('/product/:id' , async(req, res) => {
      const id = req.params.id
      const filter = {_id: new ObjectId(id)}
      const options = { upsert: true}
      const updatedProduct = req.body
      const product = {
        $set:{
          productStatus: updatedProduct.productStatus,
          productRating: updatedProduct.productRating,
          productPrice: updatedProduct.productPrice,
          productName: updatedProduct.productName,
          productImageUrl: updatedProduct.productImageUrl,
          productDescription: updatedProduct.productDescription,
          productCategory: updatedProduct.productCategory,
          productBrand: updatedProduct.productBrand,
        }
      }
      const result = await productCollection.updateOne(filter, product, options)
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