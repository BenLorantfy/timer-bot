client_ip=192.168.2.217
deploy_node_modules=0

echo "Deploying Client..."
ssh pi@$client_ip "mkdir -p ~/Projects/timer-bot/packages/client"
rsync -auv --delete --progress ./packages/client pi@$client_ip:~/Projects/timer-bot/packages --exclude="**/node_modules"

echo "Done deploy"