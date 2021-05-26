#!/usr/bin/env bash                                                                                                                    

# This script should be positioned in /etc/NetworkManager/dispatcher.d/
# This script disconnects wifi card when wifi dongle connects and reconnects wifi card when
# wifi dongle disconnects. That way, when dongle is connected, we are sure it is being used instead of
# wifi card being used, and it all happens automatically.

event_interface=$1
event_type=$2

wifi_card_interface="wlp3s0"
wifi_dongle_interface="wlp0s20f0u2"

get_wifi_card_connection_state () {
    nmcli device show "$wifi_card_interface" | grep "GENERAL.STATE:"
}

regex_connected="100 \(connected\)"
regex_disconnected="30 \(disconnected\)"

# When wifi dongle gets connected, disconnect the wifi card.                                                                                
if [ "$event_interface" == "$wifi_dongle_interface" ] && [ "$event_type" == "up" ]; then
    echo "Wifi dongle came up: trying to ensure that wifi card is disconnected." | systemd-cat -t dispatch_script
    # If wifi card is connected, disconnect it.                                                                                             
    wifi_card_connection_state=$(get_wifi_card_connection_state)
    if [[ "$wifi_card_connection_state" =~ $regex_connected ]]; then
        nmcli device disconnect "$wifi_card_interface" || true # We ignore errors.                                                          
    fi
fi

# When wifi dongle gets disconnected, connect the wifi card.                                                                                
if [ "$event_interface" == "$wifi_dongle_interface" ] && [ "$event_type" == "down" ]; then
    echo "Wifi dongle went down: trying to ensure that wifi card is connected." | systemd-cat -t dispatch_script
    # If wifi card is disconnected, connect it.                                                                                             
    wifi_card_connection_state=$(get_wifi_card_connection_state)
    if [[ "$wifi_card_connection_state" =~ $regex_disconnected ]]; then
        nmcli device connect "$wifi_card_interface" || true # We ignore errors.                                                             
    fi
fi

# TODO: What if wifi dongle connects before the wifi card? In that case nobody will disable wifi card once it connects.                     
#   But maybe that is not a problem, because in that case wifi dongle should have lower route metric.                                       
#   For now I will not take care of this, if it becomes a problem I will revisit it.      
