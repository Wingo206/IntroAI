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
%weight = zeros(28*28 + 1,10);
weight = rand(28*28 + 1, 10);
learningRate = 10;
changeMade = true;
counter = 0;

while (changeMade == true)
   changeMade = false;
   counter = 0;
   disp("hi:");
   for i = 1 : 5000
       predictions = zeros(1,10);
       currentImage = ones(28*28 + 1, 1);
       currentImage(2:end) = reshape(digitImagesArray(:,:,i), [28*28,1]);
       currentImage = repmat(currentImage, [1, 10]);
       z = currentImage .* weight;
       predictions = sum(z);
       currentLabel = zeros(1, 10);
       currentLabel(labels(i) + 1) = 1;
       normalizedPredictions = predictions > 0;
       adjustedMask = currentLabel - normalizedPredictions;
       adjustedMask = repmat(adjustedMask, [28*28+1,1]);
       weight = weight + learningRate * adjustedMask .* currentImage;
       currentChangeMade = sum(abs(adjustedMask), "all") > 0;
       changeMade = changeMade || currentChangeMade;
       counter = counter + currentChangeMade;
   end 
      disp(counter);
end
writematrix(weight, "perceptronWeights.csv");
%% test perceptron
weight = csvread("perceptronWeightsA.csv");
digitValidationFile = fopen("digitdata/validationimages", "r");
digitValidationLabelFile = fopen("digitdata/validationlabels", "r");
validationLabels = fscanf(digitValidationLabelFile, "%d");
line = fgetl(digitValidationFile)
digitImagesArray = zeros(28,28,1000);
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
    line = fgetl(digitValidationFile);
end

results = zeros(1,1000);

for i = 1 : 1000
       predictions = zeros(1,10);
       currentImage = ones(28*28 + 1, 1);
       currentImage(2:end) = reshape(digitImagesArray(:,:,i), [28*28,1]);
       currentImage = repmat(currentImage, [1, 10]);
       z = currentImage .* weight;
       predictions = sum(z);
       [~, predictedDigit] = max(predictions);
       predictedDigit = predictedDigit - 1;
       results(i) = validationLabels(i) == predictedDigit;
end
accuracy = mean(results)