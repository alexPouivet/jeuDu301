import * as React from 'react';
import { View, Text, Button, TextInput, StyleSheet } from 'react-native';
import InputSpinner from "react-native-input-spinner";
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

export default function Partie({ navigation, route }) {

  const {game_id } = route.params;

  const [game, setGame] = React.useState(null);
  const [joueur, setJoueur] = React.useState(null);


  const [points20, setPoints20] = React.useState(0);
  const [points10, setPoints10] = React.useState(0);
  const [points8, setPoints8] = React.useState(0);
  const [points6, setPoints6] = React.useState(0);
  const [points4, setPoints4] = React.useState(0);
  const [points2, setPoints2] = React.useState(0);
  const [point1, setPoint1] = React.useState(0);


  React.useEffect(() => {
    db.transaction((tx) => {
      // Récupère de la bdd la partie en cours
      tx.executeSql(`SELECT * FROM game WHERE game.game_id = ?`, [game_id],
        function(tx, res) {
          setGame(res.rows["_array"][0])
          // Récupère le joueur dont c'est le tour de jouer
          tx.executeSql(`SELECT * FROM joueur WHERE joueur.game_id = ? AND joueur.position_joueur_en_cours = ?`, [game_id, res.rows["_array"][0].tour_joueur], (_, { rows: { _array } }) => setJoueur(_array[0]));
        });
    });
  }, []);

  if (joueur === null) {
    return null;
  }


  let totalPalets = game.nb_palets - (points20 + points10 + points8 + points6 + points4 + points2 + point1)
  let isPaletsEqualZero = false

  return(
    <View>
      <Button
        title="Classement"
        onPress={() => {
          navigation.navigate('Classement', {
            game_id: game_id
          })
        }}
      />
      <Text>{totalPalets} {totalPalets == 0 ? isPaletsEqualZero = true : isPaletsEqualZero = false } | Tour n°{game.tour_game} | {joueur.score_joueur - (points20*20 + points10*10 + points8*8 + points6*6 + points4*4 + points2*2 + point1)} points</Text>
      <Text>{joueur.nom_joueur}</Text>
      <InputSpinner
        max={game.nb_palets}
        min={0}
        step={1}
        value={points20}
        onChange={(num)=>{
          setPoints20(num)
        }}
        editable={false}
        buttonRightDisabled={isPaletsEqualZero ? true : false || joueur.score_joueur - (points20*20 + points10*10 + points8*8 + points6*6 + points4*4 + points2*2 + point1) < 20 ? true : false}
      />
      <InputSpinner
        max={game.nb_palets}
        min={0}
        step={1}
        value={points10}
        onChange={(num)=>{
          setPoints10(num)
        }}
        editable={false}
        buttonRightDisabled={isPaletsEqualZero ? true : false || joueur.score_joueur - (points20*20 + points10*10 + points8*8 + points6*6 + points4*4 + points2*2 + point1) < 10 ? true : false}
      />
      <InputSpinner
        max={game.nb_palets}
        min={0}
        step={1}
        value={points8}
        onChange={(num)=>{setPoints8(num)}}
        editable={false}
        buttonRightDisabled={isPaletsEqualZero ? true : false || joueur.score_joueur - (points20*20 + points10*10 + points8*8 + points6*6 + points4*4 + points2*2 + point1) < 8 ? true : false}
      />
      <InputSpinner
        max={game.nb_palets}
        min={0}
        step={1}
        value={points6}
        onChange={(num)=>{setPoints6(num)}}
        editable={false}
        buttonRightDisabled={isPaletsEqualZero ? true : false || joueur.score_joueur - (points20*20 + points10*10 + points8*8 + points6*6 + points4*4 + points2*2 + point1) < 6 ? true : false}
      />
      <InputSpinner
        max={game.nb_palets}
        min={0}
        step={1}
        value={points4}
        onChange={(num)=>{setPoints4(num)}}
        editable={false}
        buttonRightDisabled={isPaletsEqualZero ? true : false || joueur.score_joueur - (points20*20 + points10*10 + points8*8 + points6*6 + points4*4 + points2*2 + point1) < 4 ? true : false}
      />
      <InputSpinner
        max={game.nb_palets}
        min={0}
        step={1}
        value={points2}
        onChange={(num)=>{setPoints2(num)}}
        editable={false}
        buttonRightDisabled={isPaletsEqualZero ? true : false || joueur.score_joueur - (points20*20 + points10*10 + points8*8 + points6*6 + points4*4 + points2*2 + point1) < 2 ? true : false}
      />
      <InputSpinner
        max={game.nb_palets}
        min={0}
        step={1}
        value={point1}
        onChange={(num)=>{setPoint1(num)}}
        editable={false}
        buttonRightDisabled={isPaletsEqualZero ? true : false || joueur.score_joueur - (points20*20 + points10*10 + points8*8 + points6*6 + points4*4 + points2*2 + point1) < 1 ? true : false}
      />
      <Text>{joueur.position_joueur_en_cours} {game.nb_joueurs_restant}</Text>
      {joueur.position_joueur_en_cours < game.nb_joueurs_restant ?
        <Button
          title="Joueur suivant"
          onPress={() => {
            // Met à jour le joueur et passe au joueur suivant
            updateJoueur(points20, points10, points8, points6, points4, points2, point1, joueur, game).then(function(array) {
              const [ game_id, isJoueurWin ] = array

              if(isJoueurWin == true) {
                navigation.push('Gagnant Partie', {
                  game_id: game_id,
                })
              } else {
                navigation.push('Partie', {
                  game_id: game_id,
                })
              }
            })
          }}
        />
        :
        <Button
          title="Terminer le Tour 1"
          onPress={() => {
            // Met à jour le score du joueur et passe à la page Fin de Tour
            updateJoueur(points20, points10, points8, points6, points4, points2, point1, joueur, game).then(function(array) {
              const [ game_id, isJoueurWin ]= array

              if(isJoueurWin == true) {
                navigation.push('Gagnant Partie', {
                  game_id: game_id,
                })
              } else {
                navigation.push('Fin de Tour', {
                  game_id: game_id,
                })
              }
            })
          }}
        />
      }
      <Button
        title="Retourner à l'accueil"
        onPress={() => {
          navigation.navigate('Accueil')
        }}
      />
    </View>
  )
}

const updateJoueur = function(points20, points10, points8, points6, points4, points2, point1, joueur, game) {

  return new Promise(function(resolve, reject) {

    const points = points20 * 20 + points10 * 10 + points8 * 8 + points6 * 6 + points4 * 4 + points2 * 2 + point1

    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE joueur SET score_joueur = score_joueur - ?, tour_joueur = tour_joueur +1 WHERE joueur_id = ?', [points, joueur.joueur_id]
      );
      if(joueur.position_joueur_en_cours < game.nb_joueurs_restant) {
        // Met à jour le tour du joueur pour faire jouer le joueur suivant
        tx.executeSql(
          'UPDATE game SET tour_joueur = ? + 1 WHERE game_id = ?', [game.tour_joueur, game.game_id]
        )
      }
      else {
        // Réinitialise le compteur du tour pour refaire jouer le premier joueur au prochain tour
        tx.executeSql(
          'UPDATE game SET tour_joueur = ? WHERE game_id = ?', [1, game.game_id]
        )
      }

      // Retourne l'id de la partie en cours
      if (joueur.score_joueur - points == 0) {

        if(game.gagnant_game == null) {
          tx.executeSql('UPDATE game SET gagnant_game = ? WHERE game_id = ?', [joueur.nom_joueur, game.game_id])
          tx.executeSql('UPDATE joueur SET classement_joueur = ? WHERE joueur_id = ?', [1, joueur.joueur_id])
        } else {
          tx.executeSql('UPDATE joueur SET classement_joueur = ? WHERE joueur_id = ?', [game.nb_joueurs - (game.nb_joueurs_restant -1), joueur.joueur_id])
        }

        let isJoueurWin = true
        resolve([game.game_id, isJoueurWin])
      } else {
        let isJoueurWin = false
        resolve([game.game_id, isJoueurWin])
      }
    })

  })
}
