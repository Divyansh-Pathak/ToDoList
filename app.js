//jshint esversion:6
//lpu@453515
const cool = require('cool-ascii-faces');
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoose.connect("mongodb://localhost:27017/toDoListDB", { useNewUrlParser: true });
mongoose.connect("mongodb+srv://divyansh_pathak:@Anshu0029@learning.dyfk0.mongodb.net/todolistDB?retryWrites=true&w=majority", { useNewUrlParser: true });

const itemSchema = new mongoose.Schema({
  name: String
});
const Item = mongoose.model("item", itemSchema);





const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

var defaultItems = [item1,item2,item3];

const listSchema = new mongoose.Schema({
  name: String,
  listItem: [itemSchema]
});
const List = mongoose.model("list", listSchema);




//response for homepage

app.get("/", function(req, res) {

  Item.find({},function (err, itemFound) {

    if (itemFound.length===0) {
      Item.insertMany(defaultItems, function (err) {
        if(err){
          console.log(err);
        } else{
          console.log("Success");
        }
      });

      res.redirect("/");


    } else {

        res.render("list", {listTitle: "Today", newListItems: itemFound});

    }

  });

});

app.get('/cool', (req, res) => res.send(cool()));

//express routing
app.get("/:paramName",function (req , res) {

  const listName = _.capitalize(req.params.paramName);

  List.findOne({name:listName}, function (err , foundName) {
    if (err) {
      console.log(err);
    } else {
      if (!foundName) {
        console.log("I am here in if statement");
        var list1 = new List({
          name: listName,
          listItem: defaultItems
        });
        list1.save();

       res.redirect("/" + listName);

      }else {
        console.log("I am here in express routing else statement");
      res.render("list", {listTitle: foundName.name, newListItems: foundName.listItem });
      }
    }
  });


});

//post request on homepage

app.post("/", function(req, res){

  const itm = req.body.newItem;
  const title = req.body.list;

  const newItem = new Item({
    name: req.body.newItem
  });

  if (title==="Today") {

      newItem.save();
      res.redirect("/");

  } else {
    List.findOne({name: title}, function (err , foundItem) {
      if (err) {
        console.log(err);
      } else {
        foundItem.listItem.push(newItem);
        foundItem.save();
        res.redirect("/" + title);
      }
    });
  }


});

app.post("/delete", function (req , res) {

  itemID = req.body.checkbox ;
  listName = req.body.newListItems;
  if (listName==="Today") {
    Item.findById(req.body.checkbox, function (err, item) {
      if(err){
        console.log(err);
      }else{
        item.remove();
      }
    });
  res.redirect("/")
  } else {


    List.findOneAndUpdate({name: listName}, {$pull: {listItem: {_id: itemID}}}, function(err, foundList){
      if (err){
        console.log(err);

      }else {
        console.log(foundList);
        res.redirect("/" + listName);
      }
    });
  }


});

// "engines": {
//   "node": "12.16.3"
// },


//Server listen on port 3000

app.listen( process.env.PORT , function() {
  console.log("Server started on port 3000");
});
