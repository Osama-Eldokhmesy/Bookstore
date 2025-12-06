let allBooks = [];
let displayedBooks = [];
let currentPage = 1;
const booksPerPage = 4;

let cart = []; 

$(document).ready(function() {
    $.ajax({
        url: 'books.json',
        method: 'GET',
        dataType: 'json',
        success: function(data) {
            allBooks = data;
            displayedBooks = allBooks;
            renderBooks();
        },
        error: function() { alert("Please run on XAMPP localhost!"); }
    });

    $('#search-input').on('keyup', function() {
        let val = $(this).val().toLowerCase();
        displayedBooks = allBooks.filter(b => 
            b.title.toLowerCase().includes(val) || b.author.toLowerCase().includes(val)
        );
        currentPage = 1;
        renderBooks();
    });

    $('#prev-btn').click(() => { if(currentPage > 1) { currentPage--; renderBooks(); } });
    $('#next-btn').click(() => { 
        if(currentPage < Math.ceil(displayedBooks.length / booksPerPage)) { currentPage++; renderBooks(); } 
    });

    // تفاعل النجوم
    $('.stars i').click(function() {
        let rating = $(this).data('value');
        $(this).parent().find('i').removeClass('fas').addClass('far');
        $(this).parent().find('i').each(function() {
            if($(this).data('value') <= rating) {
                $(this).removeClass('far').addClass('fas');
            }
        });
    });
});

function filterBooks(category) {
    $('.category-filters button').removeClass('active-cat');
    event.target.classList.add('active-cat');
    if (category === 'All') displayedBooks = allBooks;
    else displayedBooks = allBooks.filter(b => b.category === category);
    currentPage = 1;
    renderBooks();
}

function renderBooks() {
    let container = $('#book-list');
    container.empty();
    
    let start = (currentPage - 1) * booksPerPage;
    let end = start + booksPerPage;
    let pageBooks = displayedBooks.slice(start, end);

    if(pageBooks.length === 0) container.html("<p>No books found.</p>");

    pageBooks.forEach(book => {
        let card = `
            <div class="book-card" title="Click details for more info about ${book.title}">
                <img src="${book.image}" alt="${book.title}">
                <h4>${book.title}</h4>
                <p>${book.author}</p>
                <div style="color:green; font-weight:bold; margin-bottom:5px">$${book.price}</div>
                <div class="btn-group">
                    <button onclick="viewDetails(${book.id})"><i class="fas fa-eye"></i></button>
                    <button class="edit-btn" onclick="openEditModal(${book.id})"><i class="fas fa-edit"></i></button>
                    <button class="delete-btn" onclick="deleteBook(${book.id})"><i class="fas fa-trash"></i></button>
                </div>
                <button onclick="addToCart(${book.id})" style="width:100%; margin-top:5px">Add to Cart</button>
            </div>
        `;
        container.append(card);
    });
    $('#page-num').text(` Page ${currentPage} `);
}

function deleteBook(id) {
    if(confirm("Delete this book?")) {
        allBooks = allBooks.filter(b => b.id !== id);
        displayedBooks = displayedBooks.filter(b => b.id !== id);
        renderBooks();
    }
}

function openAddModal() { $('#add-modal').fadeIn(); }
function saveNewBook() {
    let imgUrl = $('#new-image').val();

    if(!imgUrl) imgUrl = "https://placehold.co/200x300/333/FFF?text=No+Image";

    let newBook = {
        id: Date.now(),
        title: $('#new-title').val(),
        author: $('#new-author').val(),
        price: Number($('#new-price').val()),
        category: $('#new-category').val(),
        description: $('#new-desc').val(),
        image: imgUrl 
    };

    allBooks.push(newBook);
    displayedBooks = allBooks;
    closeModal('add-modal');
    renderBooks();
    alert("Book Added Successfully!");
}

let currentEditId = null;
function openEditModal(id) {
    let book = allBooks.find(b => b.id === id);
    if(book) {
        currentEditId = id;
        $('#edit-title').val(book.title);
        $('#edit-author').val(book.author);
        $('#edit-price').val(book.price);
        $('#edit-desc').val(book.description);
        $('#edit-modal').fadeIn();
    }
}
function saveEditBook() {
    let book = allBooks.find(b => b.id === currentEditId);
    if(book) {
        book.title = $('#edit-title').val();
        book.author = $('#edit-author').val();
        book.price = Number($('#edit-price').val());
        book.description = $('#edit-desc').val();
        closeModal('edit-modal');
        renderBooks();
        alert("Book updated successfully!");
    }
}

function viewDetails(id) {
    let book = allBooks.find(b => b.id === id);
    if (book) {
        $('#modal-title').text(book.title);
        $('#modal-img').attr('src', book.image);
        $('#modal-author').text(book.author);
        $('#modal-price').text(book.price);
        $('#modal-desc').text(book.description);
        
        
        $('.stars i').removeClass('fas').addClass('far');
        $('#review-text').val('');
        $('#details-modal').fadeIn();
    }
}
function submitReview() {
    alert("Review submitted! Thank you.");
    $('#review-text').val('');
}

function addToCart(id) {
    let book = allBooks.find(b => b.id === id);
    if(book) {
        cart.push(book);
        $('#cart-count').text(cart.length);
        alert(book.title + " added to cart!");
    }
}

function addToCartFromModal() {
    let title = $('#modal-title').text();
    let book = allBooks.find(b => b.title === title);
    if(book) {
        addToCart(book.id);
        closeModal('details-modal');
    }
}

function openCartModal() {
    let list = $('#cart-items-list');
    list.empty();
    let total = 0;

    cart.forEach((book, index) => {
        total += book.price;
        list.append(`
            <li style="display:flex; justify-content:space-between; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:5px;">
                <span>${book.title}</span>
                <span>$${book.price} <button onclick="removeFromCart(${index})" style="background:red; padding:2px 5px; margin-left:10px;">x</button></span>
            </li>
        `);
    });

    $('#cart-total').text(total);
    $('#cart-modal').fadeIn();
}

function removeFromCart(index) {
    cart.splice(index, 1); 
    $('#cart-count').text(cart.length);
    openCartModal(); 
}

function checkout() {
    if(cart.length > 0) {
        alert("Thank you for your purchase! Total: $" + $('#cart-total').text());
        cart = []; 
        $('#cart-count').text(0);
        closeModal('cart-modal');
    } else {
        alert("Your cart is empty!");
    }
}
function closeModal(id) { $('#' + id).fadeOut(); }
$(window).click(function(event) { if ($(event.target).hasClass('modal')) $('.modal').fadeOut(); });