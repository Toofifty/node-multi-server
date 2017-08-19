Node Multi Server
=================

Run multiple Node web servers on the same port using virtual hosts.

It will proxy requests from specific hostnames to a port specified in `www/$hostname/.port`.

## Server setup

The following is the install guide for a brand new Ubuntu 16.04 server. These commands should be executed as root.

Create a user

```shell
useradd $name
passwd $name
# enter password in prompt

mkhomedir_helper $name
```

Install Node

```shell
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
apt-get install -y nodejs
```

Install pm2. This is used to manage and run the webservers themselves.

```shell
# install
npm i -g pm2

# run on startup for the user
env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $name --hp /home/$name

# allow Node and pm2 use port 80
apt-get install libcap2-bin
setcap cap_net_bind_service=+ep /usr/bin/nodejs
setcap cap_net_bind_service=+ep /usr/lib/node_modules/pm2/bin/pm2
```

Server setup is done - continue on as the user you created
```shell
su - $name
```

## Setup Multi Server

Clone the repository

```shell
git clone https://github.com/Toofifty/node-multi-server $directory
cd $directory
npm i
```

Create file for root domains (optional - without this, directoy names must be full domains)

```shell
echo -e "domain1.com\ndomain2.com\nsub.domain1.com" >> .domains
```

Initialize example server (optional)

```shell
cd www/example
npm i
```

OR create new server

```shell
cd www/
mkdir $hostname
cd $hostname
# create server (e.g. express, socket.io)
# and listen to any port (e.g 9001)
vim index.js
vim index.html
# place the port the server is listening on
# inside .port
echo $port >> .port
```

Whichever you choose, you can now start your local webserver.
You can start them anywhere (and rename the processes), but it is simplest to start the servers from `www/`.

The commands will execute `$hostname/index.js`.

```shell
cd www/
# for the example host
pm2 start example
# for a new host
pm2 start $hostname
```

You can manage your pm2 processes using:

```shell
pm2 status

pm2 show $app
pm2 log $app
pm2 start $app
pm2 stop $app
pm2 restart $app
```

Assuming your domain is pointing at your server's IP, you should be able to access `http://domain1.com:$port`.

If not, check `pm2 log $hostname`.


That's not what we want though, so let's start the multi server.
From the root of the multi-server repository:

```shell
pm2 start .
```

This will begin the multi server under the name `.`. If you'd like to use a different name, add `--name $name` to the command.

There we go! You should now be able to see your Node webserver at `http://$hostname.domain1.com` or at `http://$hostname` (assuming your DNS is set up correctly).

If you have any issues, please use the Github Issue Tracker.
