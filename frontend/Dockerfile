# Usa l'immagine di Node.js per React
FROM node:18

# Imposta la cartella di lavoro
WORKDIR /app

# Copia il package.json e installa le dipendenze
COPY package.json ./


RUN npm install --include=dev


# Copia tutto il codice del frontend
COPY . .

# Espone la porta React
EXPOSE 5173

# Comando per avviare il frontend
CMD ["npm", "start"]
#RUN npm run build