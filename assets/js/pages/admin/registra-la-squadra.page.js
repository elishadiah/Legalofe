parasails.registerPage("registra-la-squadra", {
  data: {
    users: [],
    user: null,
    teamName: null,
    credits: 0,
    loading: false,
    fileSelected: false,
    uploadingPhotos: false
  },
  mounted() {
    
  },
  computed: {},
  methods: {
    getAsyncData: _.debounce(async function (name) {
      if (!name.length) {
        this.users = [];
        return;
      }

      this.loading = true;

      const where = { fullName: { contains: name } };
      const url = `/user?where=${JSON.stringify(where)}`;

      try {
        const users = await $.getJSON(url);
        this.users = users;
      } catch (error) {
        this.users = [];
        throw error;
      } finally {
        this.loading = false;
      }
    }, 500),
    async uploadPhotos() {
      if (!this.$refs.fileInput.files[0]) {
        return;
      }

      this.uploadingPhotos = true;
      const data = new FormData();
      data.append("_csrf", window.SAILS_LOCALS._csrf);
      data.append("photos", this.$refs.fileInput.files[0]);

      try {
        const response = await axios.post("/admin/upload-players-photos", data);

        this.$buefy.notification.open({
          message: `Sono state caricate ${response.data.foundPhotos} foto`,
          type: "is-success",
        });
      } catch (e) {
        this.$buefy.notification.open({
          message: `Non è stato possibile aggiornare le foto: ${e.toString()}`,
          type: "is-danger",
        });
      } finally {
        this.uploadingPhotos = false;
      }
    },
    onFileChange() {
      this.fileSelected = this.$refs.fileInput
        ? this.$refs.fileInput.files.length === 1
        : false;
    },
  },
});
