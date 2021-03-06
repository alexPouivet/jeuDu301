import * as React from 'react';
import { View, Text, Button, TextInput, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import InputSpinner from "react-native-input-spinner";
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SQLite from 'expo-sqlite';
import Svg, { G, Path, Rect, Polyline, Line, Text as TextSvg, TSpan, Circle } from 'react-native-svg';

import ArrowLeftIcon from '../Components/Icons/arrowLeftIcon';
import PodiumIcon from '../Components/Icons/podiumIcon';
import TwentyPtsIcon from '../Components/Icons/20ptsIcon';
import TenPtsIcon from '../Components/Icons/10ptsIcon';
import EightPtsIcon from '../Components/Icons/8ptsIcon';
import SixPtsIcon from '../Components/Icons/6ptsIcon';
import FourPtsIcon from '../Components/Icons/4ptsIcon';
import TwoPtsIcon from '../Components/Icons/2ptsIcon';
import OnePtIcon from '../Components/Icons/1ptIcon';

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
  const [joueurs, setJoueurs] = React.useState(null);


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
        }
      );
      tx.executeSql('SELECT nom_joueur from joueur WHERE game_id = ?', [game_id], (_, { rows: { _array } }) => setJoueurs(_array))
    });
  }, []);

  if (joueur === null || joueurs === null) {
    return null;
  }

  let liste_joueurs = []

  for(let i = 0; i < joueurs.length; i++) {
    liste_joueurs.push(
      <View key={i} style={styles.joueur}>
        { joueurs[i].nom_joueur == joueur.nom_joueur ?
            <Text style={[styles.nomJoueur, styles.joueurEnCours]}>{joueurs[i].nom_joueur}</Text>
           :
            <Text style={[styles.nomJoueur]}>{joueurs[i].nom_joueur}</Text>
        }
        {/*  i+1 < joueurs.length ?
            <Text> > </Text>
          :
            null*/
        }
      </View>
    )
  }

  //  calcul du nombre de palets restants à jouer pendant le tour
  let totalPalets = game.nb_palets - (points20 + points10 + points8 + points6 + points4 + points2 + point1)
  let isPaletsEqualZero = false

  return(
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.buttonRetour}
          onPress={() => {
            navigation.navigate('Accueil')
          }}
        >
          <ArrowLeftIcon />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.buttonClassement}
          onPress={() => {
            navigation.navigate('Classement', {
              game_id: game_id
            })
        }}>
          <PodiumIcon />
          <Text style={styles.textClassement}>Classement actuel</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollview}>
        <View style={styles.scrollContainer}>
          <View style={styles.listeJoueurs}>
            { liste_joueurs }
          </View>
          <View style={styles.infosTour}>
            <Svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
              <G id="Groupe_109" data-name="Groupe 109" transform="translate(-63 -141)">
                <Circle id="Ellipse_2" data-name="Ellipse 2" cx="16" cy="16" r="16" transform="translate(63 141)" fill="#fff"/>
                <Circle id="Ellipse_3" data-name="Ellipse 3" cx="13" cy="13" r="13" transform="translate(66 144)" fill="#fff"/>
                <Path id="Ellipse_3_-_Contour" data-name="Ellipse 3 - Contour" d="M13,1.25A11.75,11.75,0,0,0,4.691,21.309,11.75,11.75,0,1,0,21.309,4.691,11.673,11.673,0,0,0,13,1.25M13,0A13,13,0,1,1,0,13,13,13,0,0,1,13,0Z" transform="translate(66 144)" fill="#7159df"/>
                <Circle id="Ellipse_4" data-name="Ellipse 4" cx="11" cy="11" r="11" transform="translate(68 146)" fill="#fff"/>
                <Path id="Ellipse_4_-_Contour" data-name="Ellipse 4 - Contour" d="M11,1.25A9.75,9.75,0,1,0,20.75,11,9.761,9.761,0,0,0,11,1.25M11,0A11,11,0,1,1,0,11,11,11,0,0,1,11,0Z" transform="translate(68 146)" fill="#7159df"/>
                <TextSvg id="_6" data-name="6" transform="translate(79 162)" fill="#7159df" fontSize="16" fontWeight="700"><TSpan x="-4" y="1">{totalPalets}</TSpan></TextSvg>
              </G>
            </Svg>
            <Text style={styles.textInfosTour}>{totalPalets == 0 ? isPaletsEqualZero = true : isPaletsEqualZero = false }|</Text>
            <Text style={styles.textInfosTour}>Tour {game.tour_game}</Text>
            <Text style={styles.textInfosTour}>|</Text>
            <Text style={styles.textInfosTour}>{joueur.score_joueur - (points20*20 + points10*10 + points8*8 + points6*6 + points4*4 + points2*2 + point1)} points</Text>
          </View>
          <View style={styles.inputsContainer}>
            <View style={styles.inputContainer}>
              <TwentyPtsIcon />
              <InputSpinner
                max={game.nb_palets}
                min={0}
                step={1}
                value={points20}
                style={{width: "50%"}}
                textColor="#7159df"
                buttonTextColor="#FFFFFF"
                buttonStyle={{borderBottomLeftRadius:10, borderBottomRightRadius:10, borderTopLeftRadius:10, borderTopRightRadius:10, activityOpacity: 0, backgroundColor: "#7159df", }}
                inputStyle={{backgroundColor: "#FFFFFF", width: "35%", marginLeft: 20, marginRight: 20, borderRadius: 10, fontWeight: "bold", fontSize: 30 }}
                onChange={(num)=>{
                  setPoints20(num)
                }}
                editable={false}
                buttonRightDisabled={isPaletsEqualZero ? true : false || joueur.score_joueur - (points20*20 + points10*10 + points8*8 + points6*6 + points4*4 + points2*2 + point1) < 20 ? true : false}
              />
              <TwentyPtsIcon />
            </View>
            <View style={styles.inputContainer}>
              <TenPtsIcon />
              <InputSpinner
                max={game.nb_palets}
                min={0}
                step={1}
                value={points10}
                style={{width: "50%"}}
                textColor="#7159df"
                buttonTextColor="#FFFFFF"
                buttonStyle={{borderBottomLeftRadius:10, borderBottomRightRadius:10, borderTopLeftRadius:10, borderTopRightRadius:10, activityOpacity: 0, backgroundColor: "#7159df", }}
                inputStyle={{backgroundColor: "#FFFFFF", width: "35%", marginLeft: 20, marginRight: 20, borderRadius: 10, fontWeight: "bold", fontSize: 30 }}
                onChange={(num)=>{
                  setPoints10(num)
                }}
                editable={false}
                buttonRightDisabled={isPaletsEqualZero ? true : false || joueur.score_joueur - (points20*20 + points10*10 + points8*8 + points6*6 + points4*4 + points2*2 + point1) < 10 ? true : false}
              />
              <TenPtsIcon />
            </View>
            <View style={styles.inputContainer}>
              <EightPtsIcon />
              <InputSpinner
                max={game.nb_palets}
                min={0}
                step={1}
                value={points8}
                style={{width: "50%"}}
                textColor="#7159df"
                buttonTextColor="#FFFFFF"
                buttonStyle={{borderBottomLeftRadius:10, borderBottomRightRadius:10, borderTopLeftRadius:10, borderTopRightRadius:10, activityOpacity: 0, backgroundColor: "#7159df", }}
                inputStyle={{backgroundColor: "#FFFFFF", width: "35%", marginLeft: 20, marginRight: 20, borderRadius: 10, fontWeight: "bold", fontSize: 30 }}
                onChange={(num)=>{setPoints8(num)}}
                editable={false}
                buttonRightDisabled={isPaletsEqualZero ? true : false || joueur.score_joueur - (points20*20 + points10*10 + points8*8 + points6*6 + points4*4 + points2*2 + point1) < 8 ? true : false}
              />
              <EightPtsIcon />
            </View>
            <View style={styles.inputContainer}>
              <SixPtsIcon />
              <InputSpinner
                max={game.nb_palets}
                min={0}
                step={1}
                value={points6}
                style={{width: "50%"}}
                textColor="#7159df"
                buttonTextColor="#FFFFFF"
                buttonStyle={{borderBottomLeftRadius:10, borderBottomRightRadius:10, borderTopLeftRadius:10, borderTopRightRadius:10, activityOpacity: 0, backgroundColor: "#7159df", }}
                inputStyle={{backgroundColor: "#FFFFFF", width: "35%", marginLeft: 20, marginRight: 20, borderRadius: 10, fontWeight: "bold", fontSize: 30 }}
                onChange={(num)=>{setPoints6(num)}}
                editable={false}
                buttonRightDisabled={isPaletsEqualZero ? true : false || joueur.score_joueur - (points20*20 + points10*10 + points8*8 + points6*6 + points4*4 + points2*2 + point1) < 6 ? true : false}
              />
              <SixPtsIcon />
            </View>
            <View style={styles.inputContainer}>
              <FourPtsIcon />
              <InputSpinner
                max={game.nb_palets}
                min={0}
                step={1}
                value={points4}
                style={{width: "50%"}}
                textColor="#7159df"
                buttonTextColor="#FFFFFF"
                buttonStyle={{borderBottomLeftRadius:10, borderBottomRightRadius:10, borderTopLeftRadius:10, borderTopRightRadius:10, activityOpacity: 0, backgroundColor: "#7159df", }}
                inputStyle={{backgroundColor: "#FFFFFF", width: "35%", marginLeft: 20, marginRight: 20, borderRadius: 10, fontWeight: "bold", fontSize: 30 }}
                onChange={(num)=>{setPoints4(num)}}
                editable={false}
                buttonRightDisabled={isPaletsEqualZero ? true : false || joueur.score_joueur - (points20*20 + points10*10 + points8*8 + points6*6 + points4*4 + points2*2 + point1) < 4 ? true : false}
              />
              <FourPtsIcon />
            </View>
            <View style={styles.inputContainer}>
              <TwoPtsIcon />
              <InputSpinner
                max={game.nb_palets}
                min={0}
                step={1}
                value={points2}
                style={{width: "50%"}}
                textColor="#7159df"
                buttonTextColor="#FFFFFF"
                buttonStyle={{borderBottomLeftRadius:10, borderBottomRightRadius:10, borderTopLeftRadius:10, borderTopRightRadius:10, activityOpacity: 0, backgroundColor: "#7159df", }}
                inputStyle={{backgroundColor: "#FFFFFF", width: "35%", marginLeft: 20, marginRight: 20, borderRadius: 10, fontWeight: "bold", fontSize: 30 }}
                onChange={(num)=>{setPoints2(num)}}
                editable={false}
                buttonRightDisabled={isPaletsEqualZero ? true : false || joueur.score_joueur - (points20*20 + points10*10 + points8*8 + points6*6 + points4*4 + points2*2 + point1) < 2 ? true : false}
              />
              <TwoPtsIcon />
            </View>
            <View style={styles.inputContainer}>
              <OnePtIcon />
              <InputSpinner
                max={game.nb_palets}
                min={0}
                step={1}
                value={point1}
                style={{width: "50%"}}
                textColor="#7159df"
                buttonTextColor="#FFFFFF"
                buttonStyle={{borderBottomLeftRadius:10, borderBottomRightRadius:10, borderTopLeftRadius:10, borderTopRightRadius:10, activityOpacity: 0, backgroundColor: "#7159df", }}
                inputStyle={{backgroundColor: "#FFFFFF", width: "35%", marginLeft: 20, marginRight: 20, borderRadius: 10, fontWeight: "bold", fontSize: 30 }}
                onChange={(num)=>{setPoint1(num)}}
                editable={false}
                buttonRightDisabled={isPaletsEqualZero ? true : false || joueur.score_joueur - (points20*20 + points10*10 + points8*8 + points6*6 + points4*4 + points2*2 + point1) < 1 ? true : false}
              />
              <OnePtIcon />
            </View>
          </View>
          {joueur.position_joueur_en_cours < game.nb_joueurs_restant ?
            <TouchableOpacity
              style={styles.button}
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
            >
              <Text style={{textAlign: "center", color: "#FFFFFF", fontSize: 18, fontWeight: "bold" }}>Joueur suivant</Text>
            </TouchableOpacity>
          :
            <TouchableOpacity
              style={styles.button}
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
            >
              <Text style={{textAlign: "center", color: "#FFFFFF", fontSize: 18, fontWeight: "bold" }}>Terminer le tour</Text>
            </TouchableOpacity>
          }
        </View>
      </ScrollView>
    </View>
  )
}

const updateJoueur = function(points20, points10, points8, points6, points4, points2, point1, joueur, game) {

  return new Promise(function(resolve, reject) {

    const points = points20 * 20 + points10 * 10 + points8 * 8 + points6 * 6 + points4 * 4 + points2 * 2 + point1

    db.transaction((tx) => {

      // Mise à jour du score du joueur en cours de partie et du nombre de tour joués
      tx.executeSql('UPDATE joueur SET score_joueur = score_joueur - ?, tour_joueur = tour_joueur +1 WHERE joueur_id = ?', [points, joueur.joueur_id]);
      if(joueur.position_joueur_en_cours < game.nb_joueurs_restant) {
        // Met à jour le tour du joueur pour faire jouer le joueur suivant
        tx.executeSql('UPDATE game SET tour_joueur = ? + 1 WHERE game_id = ?', [game.tour_joueur, game.game_id])
      }
      else {
        // Réinitialise le compteur du tour pour refaire jouer le premier joueur au prochain tour
        tx.executeSql('UPDATE game SET tour_joueur = ? WHERE game_id = ?', [1, game.game_id])
      }

      // Retourne l'id de la partie en cours
      if (joueur.score_joueur - points == 0) {

        if(game.gagnant_game == null) {
          // Mise à jour du gagnant de la partie lorsque le premier gagnant est déclaré
          tx.executeSql('UPDATE game SET gagnant_game = ? WHERE game_id = ?', [joueur.nom_joueur, game.game_id])
          // Mise à jour du classement du joueur ayant gagné la partie
          tx.executeSql('UPDATE joueur SET classement_joueur = ? WHERE joueur_id = ?', [1, joueur.joueur_id])
        } else {
          // Mise à jour du classement du joueur ayant terminé la partie mais pas en première position
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop:10,
    alignItems: "center"
  },
  buttonContainer: {
    width: "100%",
    flexDirection: "row",
    marginBottom: 15,
  },
  buttonRetour: {
    width: 42,
    height: 42,
    backgroundColor: "#f3f3f3",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
    marginLeft:10,
  },
  buttonClassement: {
    marginLeft:10,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: "center",
    width: "70%",
    flexDirection: "row",
    backgroundColor: "#f3f3f3",
  },
  textClassement: {
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#24334c",
  },
  scrollview: {
    width: "100%"
  },
  scrollContainer: {
    alignItems: "center",
    marginBottom: 10
  },
  listeJoueurs: {
    flexDirection: "row",
    width: "95%",
    justifyContent: "space-evenly",
  },
  joueur: {
  },
  nomJoueur: {
    fontSize: 14,
    textTransform: "uppercase",
    color: "#24334c",
  },
  joueurEnCours: {
    fontWeight: "bold",
    textDecorationLine: 'underline',
    color: "#7159df",
  },
  infosTour: {
    backgroundColor: "#7159df",
    marginTop:15,
    width: "75%",
    alignItems: "center",
    borderRadius: 10,
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-evenly"
  },
  textInfosTour: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: "bold"
  },
  inputsContainer: {
    width: "90%",
    marginTop: 10,
  },
  inputContainer: {
    justifyContent: "space-between",
    width: "100%",
    backgroundColor: "#F3F3F3",
    borderRadius: 10,
    marginBottom: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    flexDirection: "row"
  },
  button: {
    paddingVertical: 15,
    borderRadius: 10,
    width: "90%",
    backgroundColor: "#7159df",
  }
})
