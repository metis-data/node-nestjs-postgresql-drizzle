ssh-keygen -R '[localhost]:58222'
pkill -f "ssh -i $(pwd)/ssh_tunnel/tunnel_rsa tunnel@localhost -p 58222"
docker stop node_nestjs_postgresql_drizzle -t 1
docker rm --force node_nestjs_postgresql_drizzle
docker rmi --force node_nestjs_postgresql_drizzle
docker stop node_nestjs_postgresql_drizzle_ssh -t 1
docker rm --force node_nestjs_postgresql_drizzle_ssh
docker rmi --force node_nestjs_postgresql_drizzle_ssh
docker rmi --force public.ecr.aws/o2c0x5x8/community-images-backup:lscr.io-linuxserver-openssh-server
docker rmi --force public.ecr.aws/o2c0x5x8/application-base:node-nestjs-postgres-drizzle
docker system prune
docker image prune -a
docker volume prune