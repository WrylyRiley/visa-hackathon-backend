# latest official node image
FROM node:alpine

MAINTAINER Jonathan Foster <jxf9099@rit.edu>

# use nodemon for development
RUN npm install --global nodemon

# use cached layer for node modules
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /usr/src && cp -a /tmp/node_modules /usr/src/

# add project files
WORKDIR /usr/src
ADD . /usr/src

EXPOSE 4000

CMD ["nodemon", "-L", "/usr/src/bin/www"]
