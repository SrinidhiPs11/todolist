//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const path = require('path');
const mongoose = require("mongoose");
const app = express();
const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/todolistdb",{useNewURLParser: true});

const itemSchema = {
  name: String
};
const Item = mongoose.model("items", itemSchema);

const item1 = new Item({
  name: "Welcome to the To-do-List"
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
});

const item3 = new Item({
  name: "<== Hit this to delete an item"
});

const defaultItems = [item1,item2,item3];

const listSchema = {
  name: String,
  items: [itemSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {

Item.find({}).then(function(foundItems){
if(foundItems.length === 0 ){
Item.insertMany(defaultItems)
  .then(() => console.log("successfully saved items to DB"))
  .catch((err) => {console.error(err);});
  res.redirect("/");
}else{
  res.render("list", {listTitle: "Today", newListItems: foundItems});
}
})
});

app.get("/:customListname", function(req,res){
const customListName = _.capitalize(req.params.customListname);

List.findOne({name: customListName})
.then((function(foundlist){
  if(!foundlist){
    //create new lists
    const list = new List({
      name: customListName,
      items: defaultItems
    });
    
    list.save();
    res.redirect("/"+customListName)
  }else{
    //show existing list
    res.render("list",{listTitle: foundlist.name , newListItems: foundlist.items});
  }
})) 
.catch((err) => {console.error(err);});



});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item =  new Item({
    name: itemName 
  }); 
  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName})
    .then(function(foundlist){
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+listName);
    })
  }
  
});

app.post("/delete", function(req,res){
const checkedId = req.body.checkbox;
const listName = req.body.listName;
if(listName === "Today"){
  setTimeout(remove, 2000);
}else{

  List.findOneAndUpdate({name: listName},{$pull:{items:{_id : checkedId}}})
  .then(()=> {res.redirect("/"+listName);
})
}

function remove(){
Item.findByIdAndRemove(checkedId)
.then(function(err){
  if(!err){
    console.log("successfully removed ")
    }
    res.redirect("/");
})
}
});


app.get("/about", function(req, res){
  res.render("about");
});

//render a not found page 
app.use((req, res) => {
  const notFoundPagePath = path.join(__dirname, 'public/error_page', 'not_found.html');
  res.status(404).sendFile(notFoundPagePath);
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
