const Sequelize = require('sequelize')

module.exports = class Hashtag extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            title: {
               type: Sequelize.STRING(15),
               allowNull: false,
               unique: true,
            },
         },
         {
            sequelize,
            timestamps: true,
            underscored: false,
            modelName: 'Hashtag',
            tableName: 'hashtags',
            paranoid: true,
            charset: 'utf8mb4',
            collate: 'utf8mb4_general_ci',
         }
      )
   }
   static associate(db) {
      db.Hashtag.belongsToMany(db.Post, {
         through: 'PostHashtag',
         foreignKey: 'hashtag_id', // 교차테이블에서 Hashtag모델의 FK
         otherKey: 'post_id', // Post 모델의 FK
      })
   }
}
