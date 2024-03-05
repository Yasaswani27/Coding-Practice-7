const express = require('express')
const app = express()
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const path = require('path')
const databasePath = path.join(__dirname, 'CricketMatchDetails.db')

let database = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.database,
    })

    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

app.get('/players/', async (request, response) => {
  const getPlayerQuery = `
    SELECT
      player_id 
    AS
      playerId,
      player_name 
    AS
      playerName,
    FROM
      player_details;`
  const playersArray = await database.all(getPlayerQuery)
  response.send(playersArray)
})

app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `
    SELECT
      player_id 
    AS
      playerId,
      player_name 
    AS
      playerName,
    FROM
        player_details
    WHERE
        player_id = ${playerId};`

  const player = await database.get(getPlayerQuery)
  response.send(player)
})

app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const playerDetails = request.body
  const {playerName} = playerDetails

  const updatePlayerQuery = `
    UPDATE
        player_details
    SET
        player_name = '${playerName}'
    WHERE
        player_id = ${playerId};`

  await database.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const matchDetailsQuery = `
    SELECT
      match_id AS matchId,
      match,
      year
    FROM
        match_details
    WHERE
        match_id = ${matchId};`
  const matchDetails = await database.get(matchDetailsQuery)
  response.send(matchDetails)
})

app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const getPlayerMatchQuery = `
    SELECT
      match_id AS matchId,
      match,
      year
    FROM 
      player_match_score NATURAL JOIN match_details
    WHERE
        player_id = ${playerId};`

  const playerMatch = await database.all(getPlayerMatchQuery)
  response.send(playerMatch)
})

app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const getMatchPlayersQuery = `
	    SELECT
	      player_match_score.player_id AS playerId,
	      player_name AS playerName
	    FROM 
        player_details INNER JOIN player_match_score ON player_details.player_id = player_match_score.player_id 
      WHERE 
        match_id=${matchId};`

  const playersArray = await database.all(getMatchPlayersQuery)
  response.send(playersArray)
})

app.get('/players/:playerId/playerScores', async (request, response) => {
  const {playerId} = request.params
  const getPlayerScored = `
    SELECT
      player_details.player_id AS playerId,
      player_details.player_name AS playerName,
      SUM(player_match_score.score) AS totalScore,
      SUM(fours) AS totalFours,
      SUM(sixes) AS totalSixes 
    FROM 
      player_details INNER JOIN player_match_score ON player_details.player_id = player_match_score.player_id
    WHERE 
      player_details.player_id = ${playerId};`
  const playerMatchDetails = await database.get(getMatchPlayerQuery)
  response.send(playerMatchDetails)
})

module.exports = app
