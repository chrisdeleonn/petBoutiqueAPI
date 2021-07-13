const admin = require("firebase-admin")
const credentials = require("../credentials.json")

function connectDb() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(credentials),
    })
  }
  return admin.firestore()
}

exports.getCustomers = (request, response) => {
  const db = connectDb()
  db.collection("customers")
    .get()
    .then((customerCollection) => {
      const allCustomers = customerCollection.docs.map((doc) => doc.data())
      response.send(allCustomers)
    })
    .catch((err) => {
      console.error(err)
      response.status(500).send(err)
    })
}

exports.getCustomerById = (request, response) => {
  if (!request.params.id) {
    //if there is no id, then send this error, otherwise, run
    response.status(400).send("no customer specified")
    return
  }
  const db = connectDb()
  db.collection("customers")
    .doc(request.params.id)
    .get()
    .then((doc) => {
      const customer = doc.data()
      customer.id = doc.id
      response.send(customer)
    })
    .catch((err) => {
      console.error(err)
      response.status(500).send(err)
    })
}

exports.getCustomerByQuery = (req, res) => {
  //get query from req.query
  const { fname } = req.query
  //connect to firestore
  const db = connectDb()
  //search customers collection based on query
  db.collection("customers")
    .where("fName", "==", fname)
    .get()
    .then((customerCollection) => {
      const matches = customerCollection.docs.map((doc) => {
        let customer = doc.data()
        customer.id = doc.id
        return customer
      })
      res.send(matches)
    })
    .catch((err) => {
      res.status(500).send(err)
    })
  //respond with results
}

exports.createCustomer = (req, res) => {
  const db = connectDb()

  db.collection("customers")
    .add(req.body)
    .then((docRef) => res.send(docRef.id))
    .catch((err) => res.status(500).send("customer cannot be created"))
}
