import * as React from 'react';
import { useState } from 'react';
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SQLite from 'expo-sqlite';

function openDatabase() {
  if (Platform.OS === "web") {
    return {
      transaction: () => {
        return {
          executeSql: () => {},
        };
      },
    };
  }

  const db = SQLite.openDatabase("db.db");
  return db;
}

const db = openDatabase();

export default function GagnantPartie({ navigation, route }) {

  const { game_id } = route.params;

  const [classement, setClassement] = React.useState(null);

  React.useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(`select * from joueur where joueur.game_id = ? ORDER BY joueur.score_joueur asc`, [game_id], (_, { rows: { _array } }) => setClassement(_array));
    });
  }, []);

  if (classement === null || classement.length === 0) {
    return null;
  }

  return(
    <View>
      <Text>Gagnant partie</Text>
      <Text>game_id: {game_id}</Text>
      {classement.map(({ nom_joueur, score_joueur }, i) => {
        return score_joueur == 0 ?
        <Text key={i}>Gagnant: {nom_joueur}</Text>
        :
        <Text key={i}>Partie en cours</Text>
      })}
      {classement.map(({ nom_joueur, score_joueur, tour_joueur, classement_joueur }, i) => (
        <View key={i}>
          <Text>{nom_joueur} {score_joueur} {tour_joueur}</Text>
        </View>
      ))}
      <Button
        title="Continuer la partie"
        // update de la bdd pour retirer le gagnant des joueurs à jouer et mettre le classement à jour
        onPress={() => {
          updatePartieEtJoueurs(game_id).then(function(game_id) {
            navigation.push("Partie", {
              game_id: game_id,
            })
          })

        }}
      />
      <Button
        title="Arrêter la partie"
        onPress={() => {
          terminerPartie(game_id).then(function(game_id) {
            navigation.navigate('Accueil')
          })
        }}
      />
    </View>
  )
}

const updatePartieEtJoueurs = function(game_id) {

  return new Promise(function(resolve, reject) {
    let joueur = []
    let compteur = 1

    db.transaction((tx) => {
      tx.executeSql('UPDATE game SET nb_joueurs_restant = nb_joueurs_restant - ?, tour_joueur=? WHERE  game_id = ?', [1, 1, game_id]);
      tx.executeSql('UPDATE joueur SET position_joueur_en_cours = ? WHERE game_id = ? AND score_joueur = ?', [null, game_id, 0])
      tx.executeSql(`select * from joueur where joueur.game_id = ?`, [game_id], (_, { rows: { _array } }) => {

        for(let i=0; i < _array.length; i++) {
          if(_array[i].score_joueur !== 0 && _array[i].position_joueur_en_cours !== null) {
            tx.executeSql('UPDATE joueur SET position_joueur_en_cours = ? WHERE joueur_id = ?', [compteur, _array[i].joueur_id])
            compteur++
          } else {

          }
        }
      });
      tx.executeSql("SELECT * FROM joueur where game_id = ?",[game_id], (txObj, { rows: { _array } }) => console.log(_array))
    })
    resolve(game_id)
  })
}

const terminerPartie = function(game_id) {

  return new Promise(function(resolve, reject) {
    resolve(game_id)
  })
}
