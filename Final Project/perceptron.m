%% load data 
digitTrainingFile = fopen("digitdata/trainingimages", "r");
digitTrainingLabelsFile = fopen("digitdata/traininglabels", "r");
labels = fscanf(digitTrainingLabelsFile, "%d");
line = fgetl(digitTrainingFile)
digitImagesArray = zeros(28,28,5000);
imageCounter = 1;
increment = 1;
currentDigitImage = zeros(28,28);

while(ischar(line))
    currentDigitImage(increment,:) = (line == 43) + 2*(line == 35);
    increment = increment + 1;
    if (increment > 28)
        digitImagesArray(:,:,imageCounter) = currentDigitImage;
        imageCounter = imageCounter + 1;
        increment = 1;
        currentDigitImage = zeros(28,28);
    end
    line = fgetl(digitTrainingFile);
end
%% train perceptron 
weight = zeros(28,28,10);
learningRate = 0.01;
changeMade = true;

while (changeMade == true)
   changeMade = false; 
   for i = 1 : 5000
       predictions = zeros(10);
       currentImage = digitImagesArray(:,:,i);
       currentImage = repmat(currentImage, [1, 1, 10]);
       weightTrain = currentImage .* weight;
       predictions = sum(weightTrain, [1,2]);
       currentLabel = labels(i);
       for j = 1 : length(predictions)
          if j ~= currentLabel && predictions(j) >= 0 
              %have to adjust weight here since its supposed to be negative
              %when false
              %in slides they substract the weight by -1 but here we subtract
              %by learning rate
              weight(:,:,j) = weight(:,:,j) - learningRate;
              changeMade = true;
          elseif j == currentLabel && predictions(j) < 0 
              %have to adjust weight
              %supposed to be positive when number is true 
              weight(:,:,j) = weight(:,:,j) + learningRate;
              changeMade = true;
          end 
       end
   end 
end
