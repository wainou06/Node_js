const Sequelize = require('sequelize')

module.exports = class Capital extends Sequelize.Model {
   static init(sequelize) {
      return super.init(
         {
            name: {
               type: Sequelize.STRING(100),
               allowNull: false,
            },
         },
         {
            sequelize,
            timestamps: false,
            underscored: false, // 컬럼이름을 카멜케이스로 유지할건지 -> 유지 X
            modelName: 'Capital', // 시퀄라이즈에서 사용하는 모델이름(클래스명 작성)
            tableName: 'capitals', // 데이터베이스에서 사용하는 실제 테이블 이름
            paranoid: false, // 소프트 삭제(soft delete) 활성화 여부 -> 비활성화
            charset: 'utf8mb4', //데이터베이스 생성할때 charset과 똑같이 사용
            collate: 'utf8mb4_general_ci', //데이터베이스 생성할때 collate와 똑같이 사용
         }
      )
   }
   static associate(db) {
      db.Capital.belongsTo(db.Country, {
         foreignKey: 'country_id', // capitals 테이블에서 외래키로 사용할 컬럼명
         targetKey: 'id', // country_id가 country 테이블에서 참조할 컬럼명 (country 테이블의 PK)
      })
   }
}
