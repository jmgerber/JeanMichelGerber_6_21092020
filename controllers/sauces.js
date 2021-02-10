const Sauce = require('../models/Sauce');
const fs = require('fs');
const validator = require('validator');

exports.createSauce = (req, res, next) => {
  let canSave = true;
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  let entriesArray = Object.values(sauceObject);
  for(value in entriesArray){
    if(validator.contains(entriesArray[value].toString(),'$') || validator.contains(entriesArray[value].toString(),'=')){
      console.log(entriesArray[value] + " : ce texte est invalide");
      canSave = false;
    }
  }
  // Si toutes les entrées sont correctes
  if (canSave){
    const sauces = new Sauce({
      ...sauceObject,
      likes: 0,
      dislikes: 0,
      usersLiked:[],
      usersDisliked:[],
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    sauces.save()
      .then(() => res.status(201).json({ message: 'Sauce enregistrée !'}))
      .catch(error => res.status(400).json({ error }));
  } else{
    res.status(401).json({ error: 'Certains caractères ne sont pas autorisés' });
  }
};

exports.modifySauce = (req, res, next) => {
  let canSave = true;
  if (req.file) {
    // Supprime l'ancienne image
    Sauce.findOne({ _id: req.params.id })
      .then(sauce => {
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, (err) => {
          if (err) throw err;
        });
      })
      .catch(error => res.status(400).json({ error }));
  }
  // Met à jour l'image et les infos
  const sauceObject = req.file ?
    {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  let entriesArray = Object.values(sauceObject);
  for(value in entriesArray){
    if(validator.contains(entriesArray[value].toString(),'$') || validator.contains(entriesArray[value].toString(),'=')){
      console.log(entriesArray[value] + " : ce texte est invalide");
      canSave = false;
    }
  }
  // Si toutes les entrées sont correctes
  if(canSave){
    Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
      .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
      .catch(error => res.status(400).json({ error }));
  } else{
    res.status(401).json({ error: 'Certains caractères ne sont pas autorisés' });
  }
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauces => {
      const filename = sauces.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
	Sauce.findOne({ _id: req.params.id })
	.then(sauces => res.status(200).json(sauces))
	.catch(error => res.status(404).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
	Sauce.find()
	.then(sauces => res.status(200).json(sauces))
	.catch(error => res.status(400).json({ error }));
};

exports.likeSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
  .then(sauce => {
    if (sauce.usersDisliked.indexOf(req.body.userID) == -1 && sauce.usersLiked.indexOf(req.body.userID) == -1) {
      // Si l'utilisateur n'est dans aucun des deux tableaux
      if (req.body.like == 1) {
        sauce.usersLiked.push(req.body.userId);
        sauce.likes += req.body.like;
        console.log('Like et user ajouté');
      }
      else if (req.body.like == -1) {
        sauce.usersDisliked.push(req.body.userId);
        sauce.dislikes -= req.body.like;
        console.log('Dislike et user ajouté');
      }
    }
    if (sauce.usersLiked.indexOf(req.body.userId) != -1 && req.body.like == 0) {
      // Si l'utilisateur est dans le tableau des "j'aime" et qu'il veut le retirer
      const userIndex = sauce.usersLiked.findIndex(user => user == req.body.userId);
      sauce.usersLiked.splice(userIndex, 1);
      sauce.likes -= 1;
      console.log('Like et user supprimés');
    }
    if (sauce.usersDisliked.indexOf(req.body.userId) != -1 && req.body.like == 0) {
      // Si l'utilisateur est dans le tableau des "j'aime pas" et veut le retirer
      const userIndex = sauce.usersDisliked.findIndex(user => user === req.body.userId);
      sauce.usersDisliked.splice(userIndex, 1);
      sauce.dislikes -= 1;
      console.log('Dislike et user supprimés');
    }
    sauce.save();
    res.status(201).json({ message: 'Like modifié !'});
  })
  .catch(error => res.status(500).json({ error }));
};