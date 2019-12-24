var sw = 20,
    sh = 20,
    tr = 30,
    td = 30

var snake = null,
    food = null,
    game = null

//创建方块的构造函数，xy为创建位置，classname传入参数为类名，决定创建方块的类型
function Square(x, y, classname) {
    this.X = x * sw
    this.Y = y * sh
    this.class = classname

    this.viewContent = document.createElement('div')
    this.viewContent.className = this.class
    this.parent = document.getElementById('snakeWrap')
}

//create方法将方块插入
Square.prototype.create = function () {
    this.viewContent.style.position = 'absolute'
    this.viewContent.style.width = sw + 'px'
    this.viewContent.style.height = sh + 'px'
    this.viewContent.style.left = this.X + 'px'
    this.viewContent.style.top = this.Y + 'px'

    this.parent.appendChild(this.viewContent)
}

//定义将方块删除方法
Square.prototype.remove = function () {
    this.parent.removeChild(this.viewContent)
}

//创建存储蛇信息的构造函数
function Snake() {
    this.head = null
    this.tail = null
    this.pos = []
    this.directionNum = {
        left: {
            x: -1,
            y: 0,
            rotate:180
        },
        right: {
            x: 1,
            y: 0,
            rotate: 0
        },
        up: {
            x: 0,
            y: -1,
            rotate: -90
        },
        down: {
            x: 0,
            y: 1,
            rotate: 90
        }
    }
}

//蛇初始化方法，创建一个蛇头两个蛇尾
//通过链表关系确定方块之间的关系
// 设置蛇的初始方向
Snake.prototype.init = function () {
    var snakeHead = new Square(2, 0, 'snakeHead')
    snakeHead.create()
    this.head = snakeHead
    this.pos.push([2, 0])

    var snakeBody1 = new Square(1, 0, 'snakeBody')
    snakeBody1.create()
    this.pos.push([1, 0])

    var snakeBody2 = new Square(0, 0, 'snakeBody')
    snakeBody2.create()
    this.tail = snakeBody2
    this.pos.push([0, 0])

    snakeHead.last = null
    snakeHead.next = snakeBody1

    snakeBody1.last = snakeHead
    snakeBody1.next = snakeBody2

    snakeBody2.last = snakeBody1
    snakeBody2.next = null

    this.direction = this.directionNum.right
}

/*
* 定义蛇下一步的方法
* 创建一个变量，存储蛇的下一个坐标
*
* */

Snake.prototype.getNextPos = function () {
    var nextPos = [
        this.head.X / sw + this.direction.x,
        this.head.Y / sw + this.direction.y
    ]
    //撞到自己
    var selfClash = false
    this.pos.forEach(function (value) {
        if (value[0] == nextPos[0] && value[1] == nextPos[1]) {
            selfClash = true
        }
    })

    if (selfClash) {
        console.log('crash!!')

        this.strategies.over.call(this)

        return;
    }

    //撞墙
    if (nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] > td - 1 || nextPos[1] > tr - 1) {
        console.log('撞墙')

        this.strategies.over.call(this)

        return;
    }

    //撞苹果
    if (food && food.pos[0] == nextPos[0] && food.pos[1] == nextPos[1]) {
        this.strategies.eat.call(this)

        return;
    }

    //正常走
    this.strategies.move.call(this)
}

//添加蛇行为方法
Snake.prototype.strategies = {
    move: function (format) {
        var newBody = new Square(this.head.X / sw, this.head.Y / sh, 'snakeBody')

        newBody.next = this.head.next
        newBody.next.last = newBody
        newBody.last = null

        this.head.remove()
        newBody.create()


        var newHead = new Square(this.head.X / sw + this.direction.x, this.head.Y / sh+ this.direction.y, 'snakeHead')

        newHead.last = null
        newHead.next = newBody
        newBody.last = newHead
        newHead.viewContent.style.transform = 'rotate(' + this.direction.rotate + 'deg)'
        newHead.create()

        this.pos.splice(0,0,[newHead.X/sw, newHead.Y/sh])
        this.head = newHead

        if (!format){
            this.tail.remove()
            this.tail = this.tail.last
            this.pos.pop()
        }


    },
    eat: function () {
        this.strategies.move.call(this, true)
        crateFood()
        game.score++
    },
    over: function () {
        // console.log('over')
        game.over()
    }
}

snake = new Snake()

//创建食物函数
function crateFood() {
    var x = null
    var y = null
    var include = true

    while (include) {
        x = Math.round(Math.random() * (td - 1))
        y = Math.round(Math.random() * (tr - 1))
        snake.pos.forEach(function (value) {
            if (value[0] !== x && value[1] !== y){
                include = false
            }
        })
    }
    food = new Square(x, y, 'food')
    food.pos = [x, y]

    var foodDom = document.querySelector('.food')
    if (foodDom){
        foodDom.style.left = x * sw + 'px'
        foodDom.style.top = y * sh + 'px'
    } else {

        food.create()
    }
}


function Game() {
    this.timer = null
    this.score = 0
}

Game.prototype.init = function () {
    snake.init()
    // snake.getNextPos()
    crateFood()

	var control = document.getElementsByClassName('control')[0]
	//触控控制
	control.ontouchstart = function (e) {

		e.preventDefault()

		var dir = e.target.getAttribute('class')

		if (dir == 'left' && snake.direction != snake.directionNum.right) {
			snake.direction = snake.directionNum.left
		}
		if (dir == 'right' && snake.direction != snake.directionNum.left) {
			snake.direction = snake.directionNum.right
		}
		if (dir == 'up' && snake.direction != snake.directionNum.down) {
			snake.direction = snake.directionNum.up
		}
		if (dir == 'down' && snake.direction != snake.directionNum.up) {
			snake.direction = snake.directionNum.down
		}
	}

	//按键控制
    document.onkeydown = function (e) {
        var event = e || window.event

        event.preventDefault()

        if (event.keyCode == 37 && snake.direction != snake.directionNum.right){
            snake.direction = snake.directionNum.left
        }

        if (event.keyCode == 38 && snake.direction != snake.directionNum.down){
            snake.direction = snake.directionNum.up
        }

        if (event.keyCode == 39 && snake.direction != snake.directionNum.left){
            snake.direction = snake.directionNum.right
        }

        if (event.keyCode == 40 && snake.direction != snake.directionNum.up){
            snake.direction = snake.directionNum.down
        }
    }
    this.start()
}

Game.prototype.start = function(){
    this.timer = setInterval(function () {
        snake.getNextPos()
    },200)
}

Game.prototype.pause = function(){
    clearInterval(this.timer)
}

Game.prototype.over = function(){
    clearInterval(this.timer)
    alert('得分' + this.score)

    var snakeWrape = document.getElementById('snakeWrap')
    snakeWrape.innerHTML = ''

    snake = new Snake()
    game = new Game()
    starBtn.parentNode.style.display = 'block'
}

game = new Game()

var starBtn = document.querySelector('.starBtn button')
starBtn.onclick = function(){
    starBtn.parentNode.style.display = 'none'
    game.init()
}

var snakeWrape = document.getElementById('snakeWrap')
var pauseBtn = document.querySelector('.pauseBtn button')

snakeWrape.onclick = function () {
    pauseBtn.parentNode.style.display = 'block'
    game.pause()
}

pauseBtn.onclick = function () {
    pauseBtn.parentNode.style.display = 'none'
    game.start()
}

