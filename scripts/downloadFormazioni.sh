#!/bin/bash

# cd js/

for i in {30..35}
do
  wget "http://legalofe.net/js/fcmFormazioniDati$i.js" -N -P ./js/;
  ./scripts/createFormazioni.js 2019 $i;
done