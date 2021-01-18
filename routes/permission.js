//permissions[1].permissions["update_ownProfile"]
permissions = {
    "krönikör": {
        title: "Krönikör",
        color: "#46ccf9",
        permissions: {
            modify_articles: false,
            delete_articles: false,
            assign_roles: false,
            update_ownProfile: true,
            update_allProfile: false
        }
    },
    "programledare": {
        title: "Programledare",
        color: "#FFB936",
        permissions: {
            modify_articles: true,
            delete_articles: false,
            assign_roles: false,
            update_ownProfile: true,
            update_allProfile: false
        }
    },
    "reporter": {
        title: "Reporter",
        color: "#6ade51",
        permissions: {
            modify_articles: true,
            delete_articles: false,
            assign_roles: false,
            update_ownProfile: true,
            update_allProfile: false
        }
    },
    "redaktör": {
        title: "Redaktör",
        color: "#9effdd",
        permissions: {
            modify_articles: true,
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
            modify_articles: true,
            delete_articles: true,
            assign_roles: true,
            update_ownProfile: true,
            update_allProfile: true
        }
    }
}

module.exports.permissions = permissions;