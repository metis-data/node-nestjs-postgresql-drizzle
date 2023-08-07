chmod 0600 "$(pwd)"/ssh_tunnel/tunnel_rsa

docker build -t node_nestjs_postgresql_drizzle_ssh ssh_tunnel

docker start node_nestjs_postgresql_drizzle_ssh 2>/dev/null || docker run -d \
  --name=node_nestjs_postgresql_drizzle_ssh \
  -e TZ=Etc/UTC \
  -e "PUBLIC_KEY=ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDhcqS0uL1+ymfVY0auRFIALGGNCHtRwATetPQDrFs3tdPFjcLFl1KWOkJLxawYQ3jgkmUwr3Hn+aeqkwNnoR5suD+icVYOSrjG68vOpqezUMAwV8T4wT8feJAS3x0M6yARXwxl2zCBLfip8/gryqKfR8rCt82HqFSo1GnmwuW6VKp7mqkDEcqpk0k2oSYny1j06n6tbqOdPX2qTc7sYtW53AfdcAw7QTwGeR4kr4/6kDUh2t+tl82OMbgDstZbyLR/6NjvTHVLa5qOj+D174S2KhguVWKuy7kjaElQ9xU0Bhciu19i5sxhwdR1pp1qAxJBcIuIuVtIPLWXLPj653nJ" \
  -p 127.0.0.1:58222:2222 \
  -e USER_NAME=tunnel \
  --restart unless-stopped \
  node_nestjs_postgresql_drizzle_ssh

sleep 5

ssh-keygen -R '[localhost]:58222'
pkill -f "ssh -i $(pwd)/ssh_tunnel/tunnel_rsa tunnel@localhost -p 58222"
ssh -i "$(pwd)"/ssh_tunnel/tunnel_rsa tunnel@localhost -p 58222 -4 -o StrictHostKeyChecking=no -R 5432:127.0.0.1:5432 -L 3000:127.0.0.1:3000 -fN

docker build -t node_nestjs_postgresql_drizzle .

docker start node_nestjs_postgresql_drizzle 2>/dev/null || docker run \
  --name=node_nestjs_postgresql_drizzle \
  --network 'container:node_nestjs_postgresql_drizzle_ssh' \
  node_nestjs_postgresql_drizzle
