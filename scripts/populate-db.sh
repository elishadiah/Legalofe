#!/bin/bash

DATA_FOLDER="/home/luca/dev/fantalofe/data"
YEAR=2019

# Teams

 import-json --what=squadre --json=$DATA_FOLDER/team-2018.json

# Players
sails run import-json --what=giocatori --json=$DATA_FOLDER/giocatori-2018.json

# Associate Players to Teams
sails run import-json --what="squadre-giocatori" --json=$DATA_FOLDER/squadre-giocatori.json

# Classifica
sails run import-json --what=classifica --json=$DATA_FOLDER/classifica-2018.json

# Formazioni
for i in {36..38}
do
  wget "http://legalofe.net/js/fcmFormazioniDati$i.js" -N -P $DATA_FOLDER/../js/;
  ./scripts/createFormazioni.js $YEAR $i $DATA_FOLDER;
  sails run import-json --what=formazioni --json=$DATA_FOLDER/formazioni-2018-$i.json
done

# Incontri
sails run import-json --what=incontri --json=$DATA_FOLDER/incontri-2018.json