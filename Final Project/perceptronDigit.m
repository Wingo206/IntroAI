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
%100A - full run, 0.01 learnning rate, 15 min? 
%100B - full run, 1 learning rate?, 10 min?
%100C - 300 epoch, learning rate 1, 30 sec, 0.8210
weight = rand(28*28 + 1, 10);
learningRate = 1;
changeMade = true;
counter = 0;
epochCounter = 0;

while (changeMade == true)
   changeMade = false;
   counter = 0;
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
      epochCounter = epochCounter + 1
end
writematrix(weight, "perceptronWeightsDigit.csv");
%% test perceptron
weight = csvread("perceptronWeightsDigit100C.csv");
digitValidationFile = fopen("digitdata/validationimages", "r");
digitValidationLabelFile = fopen("digitdata/validationlabels", "r");
digitTestFile = fopen("digitdata/testimages", "r");
digitTestLabelFile = fopen("digitdata/testlabels", "r");

[digitImagesArray, validationLabels] = imageFileToMatrix(digitValidationFile, digitValidationLabelFile);
[digitImagesArray2, validationLabels2] = imageFileToMatrix(digitTestFile, digitTestLabelFile);

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

%change last number for single Testing 
[predicted, real] = singleTest(digitImagesArray2, weight, validationLabels2, 10)

function [predicted, real] = singleTest(digitImagesArray, weight, validationLabels, image)
       predictions = zeros(1,10);
       currentImage = ones(28*28 + 1, 1);
       currentImage(2:end) = reshape(digitImagesArray(:,:,image), [28*28,1]);
       currentImage = repmat(currentImage, [1, 10]);
       z = currentImage .* weight;
       predictions = sum(z);
       [~, predictedDigit] = max(predictions);
       predicted = predictedDigit - 1;
       real = validationLabels(image);
end

function [outputArray, validationLabels] = imageFileToMatrix(testingFileImage, testingFileLabels)
    line = fgetl(testingFileImage)
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
        line = fgetl(testingFileImage);
    end
    outputArray = digitImagesArray;
    validationLabels = fscanf(testingFileLabels, "%d");
end