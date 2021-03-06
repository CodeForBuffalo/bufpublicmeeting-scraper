<template>
  <Layout>
    <aside class="w-1/4 sticky top-0 h-screen overflow-y-scroll px-3">
      <div class="my-5">
        <h2 class="font-medium text-2xl mb-2">Sorting &amp; Filters</h2>
        <div class="border rounded p-3 mb-4">
          <fieldset>
            <legend class="font-medium text-xl">Sort by:</legend>
            <div>
              <label
                class="cursor-pointer hover:underline flex items-center py-1"
              >
                <input
                  v-model="orderBy"
                  class="mr-2"
                  type="radio"
                  name="sorting"
                  :value="{ value: 'date', direction: 'desc' }"
                  @change="updateRouteQuery()"
                />
                <span>Meeting Date (Desc)</span>
              </label>
            </div>
            <div>
              <label
                class="cursor-pointer hover:underline flex items-center py-1"
              >
                <input
                  v-model="orderBy"
                  class="mr-2"
                  type="radio"
                  name="sorting"
                  :value="{ value: 'date', direction: 'asc' }"
                  @change="updateRouteQuery()"
                />
                <span>Meeting Date (Asc)</span>
              </label>
            </div>
            <div>
              <label
                class="cursor-pointer hover:underline flex items-center py-1"
              >
                <input
                  v-model="orderBy"
                  class="mr-2"
                  type="radio"
                  name="sorting"
                  :value="{ value: 'title', direction: 'desc' }"
                  @change="updateRouteQuery()"
                />
                <span>Meeting Name (Desc)</span>
              </label>
            </div>
            <div>
              <label
                class="cursor-pointer hover:underline flex items-center py-1"
              >
                <input
                  v-model="orderBy"
                  class="mr-2"
                  type="radio"
                  name="sorting"
                  :value="{ value: 'title', direction: 'asc' }"
                  @change="updateRouteQuery()"
                />
                <span>Meeting Name (Asc)</span>
              </label>
            </div>
          </fieldset>
        </div>
        <div class="border rounded p-3 mb-4">
          <label
            for="showPrevious"
            class="cursor-pointer hover:underline flex items-center py-1"
          >
            <input
              id="showPrevious"
              v-model="showPrevious"
              class="mr-2 cursor-pointer"
              type="checkbox"
              name="showPrevious"
              :value="true"
              @change="updateRouteQuery()"
            /><span>Show Past Meetings</span>
          </label>
        </div>
        <div class="border rounded p-3">
          <fieldset>
            <legend class="font-medium text-xl">Filter Meeting Type:</legend>
            <button
              v-if="filters.length"
              class="cursor-pointer hover:underline text-teal-700 focus:outline-none"
              @click="clearFilters()"
            >
              Clear Filters
            </button>
            <div v-for="(group, index) in filterGroups" :key="index">
              <label
                :for="index"
                class="cursor-pointer hover:underline flex items-center py-1"
              >
                <input
                  :id="index"
                  v-model="filters"
                  class="mr-2 cursor-pointer"
                  type="checkbox"
                  name="filtering"
                  :value="index"
                  @change="updateRouteQuery()"
                />
                <div>
                  <span class="mr-2">{{ group.text }}</span>
                  <span
                    class="px-2 inline-block text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800"
                    >{{ group.values.length }}
                  </span>
                </div>
              </label>
            </div>
          </fieldset>
        </div>
      </div>
    </aside>
    <main role="main" class="w-3/4 ml-auto px-3">
      <div v-for="meeting in filteredMeetings" :key="meeting.meetingId">
        <div class="border rounded p-4 mb-4">
          <div class="flex">
            <h2 class="text-2xl font-medium">
              <g-link :to="meeting.path" class="hover:underline">
                {{ meeting.title }}
              </g-link>
            </h2>
          </div>
          <div class="flex mb-3">
            <div>
              <span class="text-muted font-weight-bold">
                {{ meeting.date | dayjs }}
              </span>
            </div>
          </div>
          <div class="mb-4">
            <div class="flex -mx-4">
              <div v-for="(link, idx) in meeting.links" :key="idx" class="px-4">
                <a
                  :href="link.linkUrl"
                  class="text-teal-700 hover:text-teal-900 hover:underline"
                >
                  {{ link.linkText }}
                </a>
              </div>
            </div>
          </div>
          <p v-html="meeting.details"></p>
        </div>
      </div>
    </main>
  </Layout>
</template>

<page-query>
query {
  allMeeting {
    edges {
      node {
        details,
        links{
          linkUrl,
          linkText
        }
        meetingGroup{
          text,
          value
        },
        meetingType{
          text,
          value
        },
        date,
        path
      }
    }
  }
}
</page-query>

<script>
import dayjs from 'dayjs'

export default {
  name: 'Index',
  metaInfo: {
    title: 'Hello, world!',
  },
  filters: {
    dayjs(value) {
      return dayjs(value).format('MMMM D, YYYY - h:mmA')
    },
  },
  data() {
    return {
      filters: [],
      showPrevious: false,
      orderBy: {},
    }
  },
  computed: {
    meetings() {
      return this.$page.allMeeting.edges.map((meeting) => meeting.node)
    },
    filterGroups() {
      const obj = {}
      this.meetings.forEach((meeting) => {
        const groupIdx = meeting.meetingGroup.value
        if (!Object.keys(obj).includes(groupIdx)) {
          obj[groupIdx] = {
            text: meeting.meetingGroup.text,
            values: [],
          }
        }
        obj[groupIdx].values.push(meeting)
      })
      return obj
    },
    filteredMeetings() {
      let arr = this.meetings.map((meeting) => {
        return {
          ...meeting,
          title: `${meeting.meetingGroup.text} - ${meeting.meetingType.text}`,
        }
      })
      if (!this.showPrevious) {
        arr = arr.filter((meeting) => {
          return dayjs() < dayjs(meeting.date)
        })
      }
      if (this.filters.length > 0) {
        arr = arr.filter((meeting) => {
          return this.filters.includes(meeting.meetingGroup.value)
        })
      }

      const sortBy = (key, direction) => {
        const dir = direction === 'asc' ? -1 : 1
        return (a, b) =>
          a[key] > b[key] ? 1 * dir : b[key] > a[key] ? -1 * dir : 0
      }

      return arr.sort(sortBy(this.orderBy.value, this.orderBy.direction))
    },
  },
  created() {
    this.showPrevious = !!this.$route.query.showPrevious
    this.orderBy = this.$route.query.orderBy
      ? {
          value: this.$route.query.orderBy[0],
          direction: this.$route.query.orderBy[1],
        }
      : { value: 'date', direction: 'desc' }
    this.filters = this.$route.query.filters ? this.$route.query.filters : []
  },
  methods: {
    clearFilters() {
      this.filters = []
      this.updateRouteQuery()
    },
    updateRouteQuery() {
      const query = {}
      query.filters = this.filters.length ? this.filters : undefined
      query.orderBy = [this.orderBy.value, this.orderBy.direction]
      query.showPrevious = this.showPrevious ? true : undefined

      this.$router.replace({
        query,
      })
    },
  },
}
</script>
