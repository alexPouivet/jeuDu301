import * as React from 'react';
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

// Page Détails d'une partie
export default function DetailsPartie({ navigation, route }) {

  const {game_id } = route.params;
  const [game, setGame] = React.useState(null);
  const [joueurs, setJoueurs] = React.useState(null);

  React.useEffect(() => {
    db.transaction((tx) => {
      // Récupère les données de la partie en cours
      tx.executeSql(`SELECT * FROM game WHERE game.game_id = ?`, [game_id], (_, { rows: { _array } }) => setGame(_array[0]));
      // Récupère la liste des joueurs de la partie en cours
      tx.executeSql(`SELECT * FROM joueur WHERE joueur.game_id = ?`, [game_id], (_, { rows: { _array } }) => setJoueurs(_array));
    });
  }, []);

  if (game === null || game.length === 0 || joueurs === null || joueurs.length === 0) {
    return null;
  }


  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Ecran détails d'une partie</Text>
      <Text>game id: {game_id}</Text>
      <Text>partie statut: {game.statut}</Text>
      {joueurs.map(({ nom_joueur, score_joueur, tour_joueur }, i) => (
        <View key={i}>
          <Text>{nom_joueur}, {score_joueur}, {tour_joueur}</Text>
        </View>
      ))}
      { game.statut == "en cours" ?
      <Button
        title="Reprendre la partie"
        onPress={() => navigation.navigate('Partie', {
          game_id: game_id
        })}
      />
       :
       null
      }
      <Button
        title="Retourner à l'historique"
        onPress={() => navigation.navigate('Historique des parties')}
      />
    </View>
  );
}
