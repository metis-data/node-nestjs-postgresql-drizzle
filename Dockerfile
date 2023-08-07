FROM public.ecr.aws/o2c0x5x8/community-images-backup:node-16-slim
WORKDIR /usr/src/app
COPY package* ./
RUN npm install

COPY . ./

CMD npm start