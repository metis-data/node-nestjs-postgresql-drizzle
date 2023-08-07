FROM public.ecr.aws/o2c0x5x8/application-base:node-nestjs-postgres-drizzle
WORKDIR /usr/src/app

COPY . ./

RUN npm run build

CMD npm run start