%% load data 
faceTrainingFile = fopen("facedata/facedatatrain", "r");
faceTrainingLabelsFile = fopen("facedata/facedatatrainlabels", "r");
labels = fscanf(faceTrainingLabelsFile, "%d");
line = fgetl(faceTrainingFile)
faceImagesArray = zeros(70,60,451);
imageCounter = 1;
increment = 1;
currentFaceImage = zeros(70,60);

while(ischar(line))
    currentFaceImage(increment,:) = 1*(line == 35);
    increment = increment + 1;
    if (increment > 70)
        faceImagesArray(:,:,imageCounter) = currentFaceImage;
        imageCounter = imageCounter + 1;
        increment = 1;
        currentFaceImage = zeros(70,60);
    end
    line = fgetl(faceTrainingFile);
end
%% train neural network
%*A lambda = 0.01, 15 min, learning rate = 0.01, hiddenLayerNodes = 100,
%acc = 0.5490
%NEED LOSS FUNCTION FOR PERCEPTRON?
%ADD WAY TO TEST PERCENTAGE OF DATA
%GRAPH ALL THE ACCURACIES FOR DIFFERENT PERCENTAGES OF DATA USED 
%run multiple times for average on GRAPH  
%WRITE STUFF FOR REPORT GRAPH, EXPLAIN HOW IT WORK 
%THATS IT

%*100A, epochs = 300, lambda = 0.1, learningRate = 0.1, hiddenLayer = 20, trainacc = 0.9911,
%acc = 0.8970
%*100B, epochs = 395, lambda = 0.1, learningRate = 0.1, hiddenLayer = 10,
%trainacc = 0.9867, acc = 0.8804
%*100C, epochs = 370, lambda = 0.1, learningRate = 0.1, hiddenLayer = 20,
%trainacc = 0.9823, acc = 0.8704
lambda = 0.1;
learningRate = 0.1;
hiddenLayerNodes = 20;
outputLayerNodes = 1;
inputLayerNodes = 70*60;
epochs = 100;
weight1 = 2*rand(inputLayerNodes + 1, hiddenLayerNodes)-1;
weight2 = 2*rand(hiddenLayerNodes + 1, outputLayerNodes)-1;
totalCost = 9999;
epochCounter = 0;

%%for i = 1:epochs
prevAccs = zeros(1, 10);
while learningRate > 0.001 
   totalCost = 0;
   grad1 = zeros(inputLayerNodes + 1, hiddenLayerNodes);
   grad2 = zeros(hiddenLayerNodes + 1, outputLayerNodes);
   numCorrect = 0;
   for j = 1:451
       %forward feed
       a0flip = ones(inputLayerNodes + 1, 1);
       a0flip(2:end) = reshape(faceImagesArray(:,:,j), [70*60,1]);
       a0flipRep = repmat(a0flip, [1, hiddenLayerNodes]);
       zs1 = weight1 .* a0flipRep;
       z1 = sum(zs1);
       
       a1 = (1 + exp(-z1)).^-1;
       a1flip = ones(hiddenLayerNodes + 1, 1);
       a1flip(2:end) = a1';
       a1flipRep = a1flip;
       zs2 = weight2 .* a1flipRep;
       z2 = sum(zs2);
       a2 = (1 + exp(-z2)).^-1;
  
       %back propagation
       currentLabel = zeros(1, 1);
       normalizedPredictions = a2 > 0.5;
       numCorrect = numCorrect + (labels(j) == normalizedPredictions);
       currentLabel = labels(j);
       d2 = a2 - currentLabel;
       d1 = (weight2*(d2')).*(a1flip.*(1-a1flip));
       grad1 = grad1 + (repmat(a0flip, [1, hiddenLayerNodes]) .* repmat(d1(2:end)', [inputLayerNodes+1, 1]));
       grad2 = grad2 + (repmat(a1flip, [1, outputLayerNodes]) .* repmat(d2, [hiddenLayerNodes+1, 1]));
       %update cost
       totalCost = totalCost + sum(currentLabel.*log(a2) + (1-currentLabel).*log(1-a2)); 
        
   end
   D1 = (1/451) * grad1;
   D1(2:end, :) = D1(2:end, :) + lambda*weight1(2:end, :);
   
   D2 = (1/451) * grad2;
   D2(2:end, :) = D2(2:end, :) + lambda*weight2(2:end, :);
   
   %change weights
   weight1 = weight1 - learningRate*D1;
   weight2 = weight2 - learningRate*D2;
   
   %cost function 
   totalCost = (-1/451)*totalCost;
   totalCost = totalCost + lambda/(2*451) * sum(weight1.^2,"all");
   totalCost = totalCost + lambda/(2*451) * sum(weight2.^2,"all");
   epochCounter = epochCounter + 1;
   disp(epochCounter);
   disp(totalCost);
   disp(learningRate);
   trainingAcc = numCorrect / 451
   
   % adaptive learning rate
   prevAccs(mod(epochCounter, length(prevAccs)) + 1) = trainingAcc;
   if trainingAcc < mean(prevAccs) + 0.01
      %learningRate = learningRate * 0.75
      prevAccs = zeros(1, 10);
   end
end

writematrix(weight1, "NNweight1_100_face.csv");
writematrix(weight2, "NNweight2_100_face.csv");
%% Test Neural Network
weight1 = csvread("NNweight1_100_face_C.csv");
weight2 = csvread("NNweight2_100_face_C.csv");
faceValidationFile = fopen("facedata/facedatavalidation", "r");
faceValidationLabelFile = fopen("facedata/facedatavalidationlabels", "r");
faceTestFile = fopen("facedata/facedatatest", "r");
faceTestLabelFile = fopen("facedata/facedatatestlabels", "r");

[faceImagesArray, validationLabels] = imageFileToMatrix(faceValidationFile, faceValidationLabelFile);
[faceImagesArray2, validationLabels2] = imageFileToMatrix(faceTestFile, faceTestLabelFile);


results = zeros(1,301);

for i = 1 : 301
       %forward feed
       a0flip = ones(inputLayerNodes + 1, 1);
       a0flip(2:end) = reshape(faceImagesArray(:,:,i), [70*60,1]);
       a0flipRep = repmat(a0flip, [1, hiddenLayerNodes]);
       zs1 = weight1 .* a0flipRep;
       z1 = sum(zs1);
       a1 = (1 + exp(-z1)).^-1;
       a1flip = ones(hiddenLayerNodes + 1, 1);
       a1flip(2:end) = a1';
       a1flipRep = repmat(a1flip, [1, outputLayerNodes]);
       zs2 = weight2 .* a1flipRep;
       z2 = sum(zs2);
       a2 = (1 + exp(-z2)).^-1;
       
       normalizedPredictions = a2 > 0.5;
       results(i) = validationLabels(i) == normalizedPredictions;
end
accuracy = mean(results)

[predicted, real] = singleTest(faceImagesArray2, validationLabels2, weight1, weight2, inputLayerNodes, hiddenLayerNodes, outputLayerNodes, 76)

function [predicted, real] = singleTest(faceImagesArray, validationLabels, weight1, weight2, inputLayerNodes, hiddenLayerNodes, outputLayerNodes, image)
       %forward feed
       a0flip = ones(inputLayerNodes + 1, 1);
       a0flip(2:end) = reshape(faceImagesArray(:,:,image), [70*60,1]);
       a0flipRep = repmat(a0flip, [1, hiddenLayerNodes]);
       zs1 = weight1 .* a0flipRep;
       z1 = sum(zs1);
       a1 = (1 + exp(-z1)).^-1;
       a1flip = ones(hiddenLayerNodes + 1, 1);
       a1flip(2:end) = a1';
       a1flipRep = repmat(a1flip, [1, outputLayerNodes]);
       zs2 = weight2 .* a1flipRep;
       z2 = sum(zs2);
       a2 = (1 + exp(-z2)).^-1;
       
       predicted = a2 > 0.5;
       real = validationLabels(image);
end

function [outputArray, validationLabels] = imageFileToMatrix(testingFileImage, testingFileLabels)
   line = fgetl(testingFileImage)
   faceImagesArray = zeros(70,60,301);
   imageCounter = 1;
   increment = 1;
   currentFaceImage = zeros(70,60);
    while(ischar(line))
        currentFaceImage(increment,:) = (line == 43) + 2*(line == 35);
        increment = increment + 1;
        if (increment > 70)
            faceImagesArray(:,:,imageCounter) = currentFaceImage;
            imageCounter = imageCounter + 1;
            increment = 1;
            currentFaceImage = zeros(70,60);
        end
        line = fgetl(testingFileImage);
    end
    outputArray = faceImagesArray;
    validationLabels = fscanf(testingFileLabels, "%d");
end