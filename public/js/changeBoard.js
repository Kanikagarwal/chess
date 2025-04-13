        let buttons = document.querySelectorAll("button");
        buttons.forEach((button)=>{
            button.addEventListener("click",function () {
                const selectedId = button.id;
                localStorage.setItem("boardTheme", selectedId);
                
                window.location.href="http://localhost:3000/"
            })

        })