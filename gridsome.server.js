// Server API makes it possible to hook into various parts of Gridsome
// on server-side and add custom data to the GraphQL data layer.
// Learn more: https://gridsome.org/docs/server-api/

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`
const axios = require('axios')

const apiURL =
  'https://raw.githubusercontent.com/IHIutch/bufpublicmeeting-scraper/data/index.json'

module.exports = function (api) {
  api.loadSource(async (actions) => {
    // const MeetingsData = require('./data/meetings.json')
    const getData = async () => {
      const res = await axios(apiURL)
      return await res.data
    }

    const meetingData = await getData()

    const contentType = actions.addCollection({
      typeName: 'Meeting',
    })

    meetingData.forEach((meeting) => {
      const key = Object.keys(meeting)[0]

      const groupUrlify = meeting[key].meetingGroup
        .split(' ')
        .join('-')
        .toLowerCase()

      const typeUrlify = meeting[key].meetingType
        .split(' ')
        .join('-')
        .toLowerCase()

      meeting[key].id = meeting[key].meetingId
      meeting[key].meetingGroupUrlify = groupUrlify
      meeting[key].meetingGroup = {
        value: groupUrlify,
        text: meeting[key].meetingGroup,
      }
      meeting[key].meetingTypeUrlify = typeUrlify
      meeting[key].meetingType = {
        value: typeUrlify,
        text: meeting[key].meetingType,
      }
      meeting[key].date = new Date(meeting[key].date)
      meeting[key].path =
        groupUrlify + '/' + typeUrlify + meeting[key].meetingId

      contentType.addNode(meeting[key])
    })
  })

  api.createPages(({ createPage }) => {
    // Use the Pages API here: https://gridsome.org/docs/pages-api/
  })
}
