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

export default function DetailsPartie({ navigation, route }) {

  const {game_id } = route.params;
  const [partie, setPartie] = React.useState(null);
  const [joueurs, setJoueurs] = React.useState(null);

  React.useEffect(() => {
    db.transaction((tx) => {
      tx.executeSql(`select * from game where game.game_id = ?`, [game_id], (_, { rows: { _array } }) => setPartie(_array));
      tx.executeSql(`select * from joueur where joueur.game_id = ?`, [game_id], (_, { rows: { _array } }) => setJoueurs(_array));
    });
  }, []);

  if (partie === null || partie.length === 0 || joueurs === null || joueurs.length === 0) {
    return null;
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Ecran détails d'une partie</Text>
      <Text>game id: {partie[0].liste_joueurs}</Text>
      {joueurs.map(({ nom_joueur, score_joueur, tour_joueur }, i) => (
        <View key={i}>
          <Text>{nom_joueur}, {score_joueur}, {tour_joueur}</Text>
        </View>
      ))}
      <Button
        title="Retourner à l'historique"
        onPress={() => navigation.navigate('Historique des parties')}
      />
    </View>
  );
}