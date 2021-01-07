//permissions[1].permissions["update_ownProfile"]
permissions = {
    "krönikör": {
        title: "Krönikör",
        color: "#46ccf9",
        permissions: {
            create_articles: false,
            edit_articles: false,
            delete_articles: false,
            assign_roles: false,
            update_ownProfile: true,
            update_allProfile: false
        }
    },
    "epic": {
        title: "Epic",
        color: "#FFB936",
        permissions: {
            create_articles: false,
            edit_articles: false,
            delete_articles: false,
            assign_roles: false,
            update_ownProfile: true,
            update_allProfile: false
        }
    },
    "reporter": {
        title: "Reporter",
        color: "#000000",
        permissions: {
            create_articles: true,
            edit_articles: false,
            delete_articles: false,
            assign_roles: false,
            update_ownProfile: true,
            update_allProfile: false
        }
    },
    "redaktör": {
        title: "Redaktör",
        color: "#ffffff",
        permissions: {
            create_articles: true,
            edit_articles: true,
            delete_articles: true,
            assign_roles: false,
            update_ownProfile: true,
            update_allProfile: false
        }
    },
    "chefredaktör": {
        title: "Chefredaktör",
        color: "#e280cf",
        permissions: {
            create_articles: true,
            edit_articles: true,
            delete_articles: true,
            assign_roles: true,
            update_ownProfile: true,
            update_allProfile: true
        }
    }
}

module.exports.permissions = permissions;