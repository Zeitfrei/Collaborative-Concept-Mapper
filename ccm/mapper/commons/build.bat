@echo off
echo Building commons....
echo compiling commons coffeescript sources...
call ..\build\compileAllCoffee js\
call ..\build\compileAllCoffee js\angular\
call ..\build\compileAllCoffee test\angular\js\

echo compiling commons less sources...
call ..\build\compileAllLess css\
