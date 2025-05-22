
// Utility functions for locale and timezone handling
const getLocale = async () => {
  const defaultLocale = navigator?.languages?.length
    ? navigator.languages[0]
    : navigator.language || 'en';

  const overrideLocale = screenly.settings?.override_locale;
  if (overrideLocale) {
    if (moment.locales().includes(overrideLocale)) {
      return overrideLocale;
    } else {
      console.warn(`Invalid locale: ${overrideLocale}. Using defaults.`);
    }
  }

  // If no override, try to get locale from coordinates
  try {
    const { metadata } = screenly;
    const latitude = metadata.coordinates[0];
    const longitude = metadata.coordinates[1];

    const data = await getNearestCity(latitude, longitude);
    const countryCode = data.countryIso2.toUpperCase();

    return clm.getLocaleByAlpha2(countryCode) || defaultLocale;
  } catch (error) {
    console.warn('Failed to get locale from coordinates:', error);
    return defaultLocale;
  }
};

const getTimezone = async () => {
  const overrideTimezone = screenly.settings?.override_timezone;
  if (overrideTimezone) {
    if (moment.tz.names().includes(overrideTimezone)) {
      return overrideTimezone;
    } else {
      console.warn(`Invalid timezone: ${overrideTimezone}. Using defaults.`);
    }
  }

  // If no override, try to get timezone from coordinates
  try {
    const { metadata } = screenly;
    const latitude = metadata.coordinates[0];
    const longitude = metadata.coordinates[1];

    return tzlookup(latitude, longitude);
  } catch (error) {
    console.warn('Failed to get timezone from coordinates:', error);
    return moment.tz.guess();
  }
};

const getDateTimeFormats = (locale) => {
  const is24HourFormat = moment.localeData(locale).longDateFormat('LT').includes('H');
  return {
    timeFormat: is24HourFormat ? 'HH:mm' : 'hh:mm A',
    dateFormat: 'ddd, MMM D',
    apiDateFormat: 'YYYY-MM-DD',
    is24HourFormat
  };
};

function hrDashboard() {
  return {
    loading: true,
    currentTime: '',
    employees: [],
    employeeMap: {},
    leaves: [],
    birthdays: [],
    anniversaries: [],
    API_BASE_URL: 'http://localhost:3000/api',
    // API_BASE_URL: 'https://www.charliehr.com/api',
    API_TOKEN: screenly.settings.client_id + ':' + screenly.settings.client_secret,
    // API_TOKEN: screenly.settings.api_token,
    API_HEADERS: {
      'Accept': 'application/json',
      'Authorization': `Token token=${this.API_TOKEN}`
    },
    scrollInterval: null,

    async init() {
      this.API_HEADERS = {
        'Accept': 'application/json',
        'Authorization': `Token token=${this.API_TOKEN}`
      };
      await this.updateClock();
      setInterval(() => this.updateClock(), 1000);
      await this.loadData();
      this.startAutoScroll();
    },

    startAutoScroll() {
      if (this.scrollInterval) {
        clearInterval(this.scrollInterval);
      }

      this.scrollInterval = setInterval(() => {
        const sections = document.querySelectorAll('section ul');
        sections.forEach(section => {
          if (section.scrollHeight > section.clientHeight) {
            if (section.scrollTop + section.clientHeight >= section.scrollHeight) {
              section.scrollTop = 0;
            } else {
              section.scrollTop += 1;
            }
          }
        });
      }, 50);
    },

    async updateClock() {
      const locale = await getLocale();
      const timezone = await getTimezone();
      const { timeFormat, dateFormat } = getDateTimeFormats(locale);

      const momentObject = moment().tz(timezone);
      if (locale) {
        momentObject.locale(locale);
      }

      const time = momentObject.format(timeFormat);
      const date = momentObject.format(dateFormat);

      this.currentTime = `${time} — ${date}`;
    },

    async loadData() {
      try {
        console.log('=== Starting Data Load ===');
        const [employees, leaveRequests] = await Promise.all([
          this.fetchEmployees(),
          this.fetchLeaveRequests()
        ]);

        console.log('=== Processing Employees ===');
        console.log('Total Employees:', employees.length);

        // Create employee map for quick lookup with only needed fields
        this.employeeMap = employees.reduce((map, emp) => {
          map[emp.id] = {
            id: emp.id,
            firstName: emp.first_name,
            lastName: emp.last_name,
            birthdate: emp.date_of_birth,
            startDate: emp.start_date,
            avatar: emp.profile_picture,
            displayName: emp.display_name
          };
          return map;
        }, {});

        this.employees = employees;

        // Process birthdays and anniversaries
        this.birthdays = this.getUpcomingBirthdays(employees);
        this.anniversaries = this.getUpcomingAnniversaries(employees);

        // Process leave requests - only show approved ones
        this.leaves = leaveRequests
          .filter(leave => leave.status === 'approved')
          .map(leave => {
            const employee = this.employeeMap[leave.team_member];

            if (!employee) {
              console.warn('No matching employee found for leave:', {
                leaveId: leave.id,
                teamMemberId: leave.team_member
              });
            }

            return {
              ...leave,
              employee: employee || {
                firstName: 'Unknown',
                lastName: 'Employee',
                displayName: 'Unknown Employee',
                profile_picture: null
              }
            };
          });

        console.log('=== Data Processing Complete ===');
        console.log('Total Employees:', this.employees.length);
        console.log('Total Birthdays:', this.birthdays.length);
        console.log('Total Anniversaries:', this.anniversaries.length);
        console.log('Total Active Leaves Today:', this.leaves.length);

      } catch (error) {
        console.error('=== Error Loading Data ===');
        console.error('Error:', error);
      } finally {
        this.loading = false;
      }
    },

    async fetchEmployees() {
      const res = await fetch(`${this.API_BASE_URL}/team_members`, {
        headers: this.API_HEADERS
      });

      if (!res.ok) {
        throw new Error(`Team Members API Error: ${res.status}`);
      }

      const response = await res.json();
      console.log('=== Team Members API Response ===');
      console.log(JSON.stringify(response, null, 2));

      if (!response.success) {
        throw new Error('Team Members API returned unsuccessful response');
      }

      return response.data || [];
    },

    async fetchLeaveRequests() {
      const locale = await getLocale();
      const timezone = await getTimezone();
      const { apiDateFormat } = getDateTimeFormats(locale);

      const momentObject = moment().tz(timezone);
      if (locale) {
        momentObject.locale(locale);
      }

      const today = momentObject.format(apiDateFormat);

      // console.log('Current system date:', {
      //   date: today,
      //   timezone,
      //   locale,
      //   ...getDateTimeFormats(locale)
      // });

      const res = await fetch(`${this.API_BASE_URL}/leave_requests?start_date=${today}&end_date=${today}`, {
        headers: this.API_HEADERS
      });

      if (!res.ok) {
        throw new Error(`Leave Requests API Error: ${res.status}`);
      }

      const response = await res.json();
      console.log('=== Leave Requests API Response ===');
      console.log(JSON.stringify(response, null, 2));

      if (!response.success) {
        throw new Error('Leave Requests API returned unsuccessful response');
      }

      return response.data || [];
    },

    isUpcoming(dateStr) {
      if (!dateStr) return false;

      const today = new Date();
      const date = new Date(dateStr);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth();
      const isTomorrow = date.getDate() === tomorrow.getDate() && date.getMonth() === tomorrow.getMonth();

      return isToday || isTomorrow;
    },

    getUpcomingBirthdays(employees) {
      return employees
        .filter(emp => emp.date_of_birth && this.isUpcoming(emp.date_of_birth))
        .map(emp => ({
          id: emp.id,
          firstName: emp.first_name,
          lastName: emp.last_name,
          birthdate: emp.date_of_birth,
          avatar: emp.profile_picture,
          displayName: emp.display_name
        }));
    },

    getYearsOfService(startDate) {
      const start = new Date(startDate);
      const today = new Date();
      let years = today.getFullYear() - start.getFullYear();

      if (today.getMonth() < start.getMonth() ||
          (today.getMonth() === start.getMonth() && today.getDate() < start.getDate())) {
        years--;
      }

      return years;
    },

    formatAnniversaryText(startDate) {
      const years = this.getYearsOfService(startDate);
      const dateText = this.formatUpcomingDate(startDate);
      return `${years} Year${years !== 1 ? 's' : ''} Anniversary (${dateText})`;
    },

    getUpcomingAnniversaries(employees) {
      return employees
        .filter(emp => emp.start_date && this.isUpcoming(emp.start_date))
        .map(emp => ({
          id: emp.id,
          firstName: emp.first_name,
          lastName: emp.last_name,
          startDate: emp.start_date,
          avatar: emp.profile_picture,
          displayName: emp.display_name,
          yearsOfService: this.getYearsOfService(emp.start_date)
        }));
    },

    formatDate(dateStr) {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
    },

    formatUpcomingDate(dateStr) {
      const date = new Date(dateStr);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const currentYear = today.getFullYear();
      date.setFullYear(currentYear);

      if (date.getDate() === today.getDate() && date.getMonth() === today.getMonth()) {
        return "Today";
      } else if (date.getDate() === tomorrow.getDate() && date.getMonth() === tomorrow.getMonth()) {
        return "Tomorrow";
      }
      return this.formatDate(dateStr);
    },

    // formatLeaveDate(leave) {
    //   if (!leave.start_date || !leave.end_date) return 'No date';

    //   const startDate = this.formatDate(leave.start_date);
    //   const endDate = this.formatDate(leave.end_date);

    //   if (startDate === endDate) {
    //     return startDate;
    //   }

    //   return `${startDate} - ${endDate}`;
    // },

    // isLeaveActiveToday(leave) {
    //   const today = moment().format('YYYY-MM-DD'); // Get today's date using moment.js
    //   return leave.end_date >= today;
    // }
  };
}