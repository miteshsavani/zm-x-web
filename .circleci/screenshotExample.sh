#/bin/bash
set -e

echo "Example screenshot script..."

xeyes &

BACKGROUND_PID=$!
sleep 10
if ! ps -p ${BACKGROUND_PID} ; then
  echo "Problem with GUI app, see error above."
  exit 1
fi

xwininfo -tree -root
WIN_IDENT="feh"
RESOURCE_ID=`xwininfo -tree -root | grep ${WIN_IDENT} | cut -f 1 -d '"' | sed "s/ //g"`
echo "Got window Resource ID of: ${RESOURCE_ID}"
wmctrl -i -r ${RESOURCE_ID} -b toggle,maximized_vert,maximized_horz

echo "Taking screenshot of window..."
xwd -id ${RESOURCE_ID} | convert xwd:- ${CIRCLE_ARTIFACTS}/dag_screenshot.png

echo "Killing PID: ${BACKGROUND_PID}..."
kill -HUP $!

echo "...Done"
