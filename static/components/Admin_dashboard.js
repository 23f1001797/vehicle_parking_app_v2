export default {
    name: 'Admin',
    template: `
        <div class="container ">

            {{message}}
        </div>
    `,
    data() {
        return {
            message: 'Admin dashboard'
        }
    }
}