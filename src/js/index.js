
var timer = setTimeout(function () {
    $('.wrapper').removeClass('init')
},200)


$('.item').click(function () {
    $(this).addClass('active')
    $('.wrapper').addClass('wrapper-active')
})

$('.close').click(function (e) {
    var event = e || window.event
    event.stopPropagation()
    $('.wrapper').removeClass('wrapper-active')
    $('.active').removeClass('active')
})
