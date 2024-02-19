import { DataTypes, Sequelize } from 'sequelize'

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './conferenceDb.db',
    define: {
        timestamps: false
    }
})

const User = sequelize.define('user', {
    id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    role: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
            isIn: [['organiser', 'author', 'reviewer']]
        }
    },
    firstName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    lastName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
    },
    birthDate: {
        type: Sequelize.DATE,
        allowNull: true
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
})

const Conference = sequelize.define('conference', {
    id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    theme: {
        type: Sequelize.STRING,
        allowNull: false
    },
    startDate: {
        type: Sequelize.DATE,
        allowNull: false
    },
    organiserId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
})

const Article = sequelize.define('article', {
    id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    lastModified: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW
    },
    authorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    content: {
        type: DataTypes.TEXT('long'),
        allowNull: false
    }
})

const ArtRevConf = sequelize.define('art_rev_conf', {
    id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    articleId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: 'articles',
            key: 'id'
        }
    },
    reviewerId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    conferenceId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: 'conferences',
            key: 'id'
        }
    },
    feedback: {
        type: Sequelize.STRING,
        allowNull: true
    },
    approved: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
    }
})

const UserConf = sequelize.define('user_conf', {
    id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.UUIDV4
    },
    userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    conferenceId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: 'conferences',
            key: 'id'
        }
    },
})

Article.hasOne(ArtRevConf, { foreignKey: 'articleId' });
ArtRevConf.belongsTo(Article, { foreignKey: 'articleId' });

async function initialize() {
    try {
        await sequelize.authenticate()
        console.log('Connection to db successfull')
        await sequelize.sync()
        console.log('Tables synced');
    } catch (error) {
        console.log(error)
    }
}

export { initialize, User, Conference, Article, ArtRevConf, UserConf }