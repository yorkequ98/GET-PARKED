#!/bin/bash
#
# Prerequisites: makes.txt should contain a list of option values from https://www.drive.com.au/ homepage...

MAKES=()
mkdir -p "models"

while read in; do
    MAKES+=("`echo "$in" | sed 's/">.*/">/' | sed 's/<option value="//g' | sed 's/">//g'`")
done < makes.txt

for i in "${MAKES[@]}"
do
    MODELS_RAW=`curl -s "https://www.drive.com.au/inc/ajax/ajax-select-models.php?make=$i"`
    echo $MODELS_RAW | awk 'gsub(/.*<option value="">Model: Any Model<\/option>|<\/select>.*/,"")' | \
        sed -e $'s/option> <option/\\\n/g' | sed 's/ <option//g' | sed 's/option>//g' > "models/$i.txt"

    #while read line; do
    #    echo "line; $line"
    #done < $MODELS
    #echo $MODELS

done

#printf '%s\n' "${MAKES[@]}"

